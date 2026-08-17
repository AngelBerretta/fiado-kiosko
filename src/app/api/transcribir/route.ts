import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No se recibió audio' }, { status: 400 })
    }

    const groqFormData = new FormData()
    groqFormData.append('file', audioFile)
    groqFormData.append('model', 'whisper-large-v3')
    groqFormData.append('language', 'es')
    groqFormData.append('response_format', 'json')

    const respuesta = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData,
    })

    if (!respuesta.ok) {
      const errorBody = await respuesta.text()
      console.error('Error de Groq:', errorBody)
      return NextResponse.json({ error: 'Falló la transcripción' }, { status: 502 })
    }

    const data = await respuesta.json()
    return NextResponse.json({ texto: data.text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno al transcribir' }, { status: 500 })
  }
}