import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generarSlug(nombre: string) {
  const base = nombre
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const sufijo = Math.random().toString(36).slice(2, 6)
  return `${base || 'kiosco'}-${sufijo}`
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json()

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json({ error: 'Falta el nombre del kiosco' }, { status: 400 })
    }

    let slug = generarSlug(nombre)

    for (let intento = 0; intento < 5; intento++) {
      const { data: existente } = await supabase
        .from('kioscos')
        .select('id')
        .eq('slug_acceso', slug)
        .maybeSingle()
      if (!existente) break
      slug = generarSlug(nombre)
    }

    const { data, error } = await supabase
      .from('kioscos')
      .insert({ nombre: nombre.trim(), slug_acceso: slug })
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Error creando kiosco' }, { status: 500 })
    }

    return NextResponse.json({ kiosco: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  const { data, error } = await supabase
    .from('kioscos')
    .select('id, nombre, slug_acceso')
    .eq('slug_acceso', slug)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Error buscando kiosco' }, { status: 500 })
  if (!data) return NextResponse.json({ existe: false })

  return NextResponse.json({ existe: true, kiosco: data })
}