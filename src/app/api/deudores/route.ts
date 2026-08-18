import { NextRequest, NextResponse } from 'next/server'
import { obtenerDeudoresConSaldo } from '@/lib/saldos'
import { resolverKioscoId } from '@/lib/kiosco-server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  const kioscoId = await resolverKioscoId(slug)
  if (!kioscoId) return NextResponse.json({ error: 'Kiosco no encontrado' }, { status: 404 })

  const deudores = await obtenerDeudoresConSaldo(kioscoId)
  return NextResponse.json({ deudores })
}