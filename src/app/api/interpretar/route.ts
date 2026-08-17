import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_INTERPRETACION } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json()

    if (!texto || typeof texto !== 'string') {
      return NextResponse.json({ error: 'Falta el texto a interpretar' }, { status: 400 })
    }

    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: PROMPT_INTERPRETACION },
          { role: 'user', content: texto },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    })

    if (!respuesta.ok) {
      const errorBody = await respuesta.text()
      console.error('Error de Groq (interpretar):', errorBody)
      return NextResponse.json({ error: 'Falló la interpretación' }, { status: 502 })
    }

    const data = await respuesta.json()
    const contenido = data.choices[0].message.content
    const accion = JSON.parse(contenido)

    return NextResponse.json({ accion })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno al interpretar' }, { status: 500 })
  }
}