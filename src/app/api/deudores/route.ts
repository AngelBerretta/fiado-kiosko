import { NextRequest, NextResponse } from 'next/server'
import { obtenerDeudoresConSaldo } from '@/lib/saldos'
import { resolverKioscoId } from '@/lib/kiosco-server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  const kioscoId = await resolverKioscoId(slug)
  if (!kioscoId) return NextResponse.json({ error: 'Kiosco no encontrado' }, { status: 404 })

  const deudores = await obtenerDeudoresConSaldo(kioscoId)
  return NextResponse.json({ deudores })
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, telefono, slug } = await req.json()

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 })
    }
    if (!slug) {
      return NextResponse.json({ error: 'Falta el kiosco' }, { status: 400 })
    }

    const kioscoId = await resolverKioscoId(slug)
    if (!kioscoId) {
      return NextResponse.json({ error: 'Kiosco no encontrado' }, { status: 404 })
    }

    const { data: existente, error: errorBusqueda } = await supabase
      .from('deudores')
      .select('id')
      .eq('kiosco_id', kioscoId)
      .ilike('nombre', nombre.trim())
      .maybeSingle()

    if (errorBusqueda) {
      console.error('Error buscando cliente:', errorBusqueda)
      return NextResponse.json({ error: 'Error consultando clientes' }, { status: 500 })
    }
    if (existente) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese nombre' }, { status: 409 })
    }

    const { data: nuevo, error: errorCreacion } = await supabase
      .from('deudores')
      .insert({ nombre: nombre.trim(), telefono: telefono?.trim() ? telefono.trim() : null, kiosco_id: kioscoId })
      .select()
      .single()

    if (errorCreacion) {
      console.error('Error creando cliente:', errorCreacion)
      return NextResponse.json({ error: 'Error creando cliente' }, { status: 500 })
    }

    return NextResponse.json({ deudor: nuevo })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno creando cliente' }, { status: 500 })
  }
}