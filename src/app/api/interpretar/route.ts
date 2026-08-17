import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROMPT_INTERPRETACION } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json()

    if (!texto || typeof texto !== 'string') {
      return NextResponse.json({ error: 'Falta el texto a interpretar' }, { status: 400 })
    }

    // 1. Traer nombres existentes para que la IA pueda matchear variaciones
    const { data: deudores, error: errorDeudores } = await supabase
      .from('deudores')
      .select('nombre')

    if (errorDeudores) {
      console.error('Error trayendo deudores:', errorDeudores)
    }

    const nombresExistentes = deudores?.map((d) => d.nombre) ?? []

    // 2. Armar el prompt con la lista inyectada
    const promptConContexto = `${PROMPT_INTERPRETACION}

Lista de deudores ya registrados: ${nombresExistentes.length > 0 ? nombresExistentes.join(', ') : '(ninguno todavía)'}

Si el nombre mencionado en el texto se parece a alguno de la lista (variación de apodo, error de transcripción, falta de apellido, etc.), usá EXACTAMENTE el nombre de la lista en tu respuesta. Si no se parece a ninguno, devolvé el nombre tal cual aparece en el texto.`

    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: promptConContexto },
          { role: 'user', content: texto },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
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

    return NextResponse.json({ accion, nombresExistentes })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno al interpretar' }, { status: 500 })
  }
}