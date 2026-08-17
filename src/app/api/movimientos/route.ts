import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nombre, intencion, monto, detalle } = await req.json()

    if (!nombre || !intencion) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    if (intencion === 'CONSULTAR_SALDO') {
      return NextResponse.json({ error: 'CONSULTAR_SALDO no genera un movimiento' }, { status: 400 })
    }

    if (intencion !== 'AGREGAR_DEUDA' && intencion !== 'PAGAR_DEUDA') {
      return NextResponse.json({ error: 'Intención no reconocida' }, { status: 400 })
    }

    if (!monto || monto <= 0) {
      return NextResponse.json({ error: 'El monto tiene que ser mayor a cero' }, { status: 400 })
    }

    // 1. Buscar deudor existente (case-insensitive) o crear uno nuevo
    const { data: deudorExistente, error: errorBusqueda } = await supabase
      .from('deudores')
      .select('id, nombre')
      .ilike('nombre', nombre)
      .maybeSingle()

    if (errorBusqueda) {
      console.error('Error buscando deudor:', errorBusqueda)
      return NextResponse.json({ error: 'Error consultando deudores' }, { status: 500 })
    }

    let deudorId = deudorExistente?.id

    if (!deudorId) {
      const { data: nuevoDeudor, error: errorCreacion } = await supabase
        .from('deudores')
        .insert({ nombre })
        .select('id')
        .single()

      if (errorCreacion) {
        console.error('Error creando deudor:', errorCreacion)
        return NextResponse.json({ error: 'Error creando deudor' }, { status: 500 })
      }

      deudorId = nuevoDeudor.id
    }

    // 2. Guardar el movimiento
    const tipo = intencion === 'AGREGAR_DEUDA' ? 'DEUDA' : 'PAGO'

    const { data: movimiento, error: errorMovimiento } = await supabase
      .from('movimientos')
      .insert({ deudor_id: deudorId, tipo, monto, detalle })
      .select()
      .single()

    if (errorMovimiento) {
      console.error('Error creando movimiento:', errorMovimiento)
      return NextResponse.json({ error: 'Error guardando el movimiento' }, { status: 500 })
    }

    return NextResponse.json({ deudorId, movimiento })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno guardando movimiento' }, { status: 500 })
  }
}