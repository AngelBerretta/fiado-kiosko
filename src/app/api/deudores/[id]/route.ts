import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { nombre, telefono } = await req.json()

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('deudores')
      .update({ nombre: nombre.trim(), telefono: telefono?.trim() ? telefono.trim() : null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error editando cliente:', error)
      return NextResponse.json({ error: 'Error editando cliente' }, { status: 500 })
    }

    return NextResponse.json({ deudor: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno editando cliente' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const confirmarBorrarHistorial = req.nextUrl.searchParams.get('confirmarBorrarHistorial') === 'true'

    const { count, error: errorConteo } = await supabase
      .from('movimientos')
      .select('id', { count: 'exact', head: true })
      .eq('deudor_id', id)

    if (errorConteo) {
      console.error('Error contando movimientos:', errorConteo)
      return NextResponse.json({ error: 'Error consultando historial del cliente' }, { status: 500 })
    }

    if ((count ?? 0) > 0 && !confirmarBorrarHistorial) {
      return NextResponse.json(
        {
          error: `Este cliente tiene ${count} movimiento${count === 1 ? '' : 's'} registrado${count === 1 ? '' : 's'}. Si lo eliminás, se va a perder ese historial.`,
          tieneHistorial: true,
        },
        { status: 409 }
      )
    }

    if ((count ?? 0) > 0) {
      const { error: errorBorrarMovs } = await supabase.from('movimientos').delete().eq('deudor_id', id)
      if (errorBorrarMovs) {
        console.error('Error borrando historial:', errorBorrarMovs)
        return NextResponse.json({ error: 'Error borrando el historial del cliente' }, { status: 500 })
      }
    }

    const { error: errorBorrar } = await supabase.from('deudores').delete().eq('id', id)
    if (errorBorrar) {
      console.error('Error borrando cliente:', errorBorrar)
      return NextResponse.json({ error: 'Error borrando cliente' }, { status: 500 })
    }

    return NextResponse.json({ eliminado: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno eliminando cliente' }, { status: 500 })
  }
}