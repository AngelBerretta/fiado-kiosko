import { NextRequest, NextResponse } from 'next/server'
import { obtenerDatosReportes } from '@/lib/reportes'
import { resolverKioscoId } from '@/lib/kiosco-server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  const kioscoId = await resolverKioscoId(slug)
  if (!kioscoId) return NextResponse.json({ error: 'Kiosco no encontrado' }, { status: 404 })

  const datos = await obtenerDatosReportes(kioscoId)
  return NextResponse.json(datos)
}