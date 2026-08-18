import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resolverKioscoId } from '@/lib/kiosco-server'

export async function GET(req: NextRequest) {
  const nombre = req.nextUrl.searchParams.get('nombre')
  const slug = req.nextUrl.searchParams.get('slug')

  if (!nombre) {
    return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 })
  }
  if (!slug) {
    return NextResponse.json({ error: 'Falta el kiosco' }, { status: 400 })
  }

  const kioscoId = await resolverKioscoId(slug)
  if (!kioscoId) {
    return NextResponse.json({ error: 'Kiosco no encontrado' }, { status: 404 })
  }

  const { data: deudor, error: errorDeudor } = await supabase
    .from('deudores')
    .select('id')
    .eq('kiosco_id', kioscoId)
    .ilike('nombre', nombre)
    .maybeSingle()

  if (errorDeudor) {
    console.error(errorDeudor)
    return NextResponse.json({ error: 'Error buscando deudor' }, { status: 500 })
  }

  if (!deudor) {
    return NextResponse.json({ existe: false, saldo: 0 })
  }

  const { data: movimientos, error: errorMovs } = await supabase
    .from('movimientos')
    .select('tipo, monto')
    .eq('deudor_id', deudor.id)

  if (errorMovs) {
    console.error(errorMovs)
    return NextResponse.json({ error: 'Error calculando saldo' }, { status: 500 })
  }

  const saldo = (movimientos ?? []).reduce((acc, m) => {
    return m.tipo === 'DEUDA' ? acc + Number(m.monto) : acc - Number(m.monto)
  }, 0)

  return NextResponse.json({ existe: true, saldo })
}