import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nombre, intencion, monto, detalle, confirmarSobrepago } = await req.json()

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

    let montoFinal = monto
    let detalleFinal = detalle

    // Validación de sobrepago — solo aplica a PAGO
    if (intencion === 'PAGAR_DEUDA') {
      const { data: movimientos, error: errorMovs } = await supabase
        .from('movimientos')
        .select('tipo, monto')
        .eq('deudor_id', deudorId)

      if (errorMovs) {
        console.error('Error trayendo movimientos:', errorMovs)
        return NextResponse.json({ error: 'Error calculando saldo' }, { status: 500 })
      }

      const saldoActual = (movimientos ?? []).reduce((acc, m) => {
        return m.tipo === 'DEUDA' ? acc + Number(m.monto) : acc - Number(m.monto)
      }, 0)

      if (monto > saldoActual) {
        if (!confirmarSobrepago) {
            return NextResponse.json(
            {
                error: `El pago de $${monto} supera la deuda de $${saldoActual}. Si confirmás, se va a registrar solo $${saldoActual} y el saldo quedará en $0.`,
                saldoActual,
            },
            { status: 409 }
            )
        }
        // Ajuste automático: se guarda solo lo necesario para dejar el saldo en $0
        montoFinal = saldoActual
        detalleFinal = detalle
          ? `${detalle} (ajustado de $${monto} a $${saldoActual}, saldo llevado a $0)`
          : `Pago ajustado de $${monto} a $${saldoActual} (saldo llevado a $0)`
      }

      if (montoFinal <= 0) {
        return NextResponse.json({ error: 'Este deudor ya no tiene saldo pendiente' }, { status: 400 })
      }
    }

    const tipo = intencion === 'AGREGAR_DEUDA' ? 'DEUDA' : 'PAGO'

    const { data: movimiento, error: errorMovimiento } = await supabase
      .from('movimientos')
      .insert({ deudor_id: deudorId, tipo, monto: montoFinal, detalle: detalleFinal })
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