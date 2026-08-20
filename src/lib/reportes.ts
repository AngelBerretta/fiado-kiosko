import { supabase } from './supabase'

export interface PuntoTendencia {
  etiqueta: string
  totalDeuda: number
}

export interface DatosReportes {
  totalAdeudado: number
  cantidadDeudoresActivos: number
  topDeudores: { nombre: string; saldo: number }[]
  todosLosDeudores: { nombre: string; saldo: number }[]
  tendenciaSemanal: PuntoTendencia[]
  tendenciaDiaria: PuntoTendencia[]
}

function inicioDeSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = (dia === 0 ? -6 : 1) - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function etiquetaSemana(fecha: Date): string {
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function etiquetaDia(fecha: Date): string {
  const texto = fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export async function obtenerDatosReportes(kioscoId: string | null, semanas = 8): Promise<DatosReportes> {
  let queryDeudores = supabase.from('deudores').select('id, nombre')
  if (kioscoId) queryDeudores = queryDeudores.eq('kiosco_id', kioscoId)

  const { data: deudores, error: errorDeudores } = await queryDeudores
  if (errorDeudores) console.error('Error trayendo deudores:', errorDeudores)

  const idsDeudores = (deudores ?? []).map((d) => d.id)

  if (idsDeudores.length === 0) {
    return { totalAdeudado: 0, cantidadDeudoresActivos: 0, topDeudores: [], todosLosDeudores: [], tendenciaSemanal: [], tendenciaDiaria: [] }
  }

  const { data: movimientos, error: errorMovs } = await supabase
    .from('movimientos')
    .select('deudor_id, tipo, monto, created_at')
    .in('deudor_id', idsDeudores)

  if (errorMovs) console.error('Error trayendo movimientos:', errorMovs)

  const movs = movimientos ?? []
  const nombrePorId = new Map((deudores ?? []).map((d) => [d.id, d.nombre]))

  const saldoPorDeudor = new Map<string, number>()
  for (const m of movs) {
    const actual = saldoPorDeudor.get(m.deudor_id) ?? 0
    saldoPorDeudor.set(m.deudor_id, actual + (m.tipo === 'DEUDA' ? Number(m.monto) : -Number(m.monto)))
  }

  const saldosPositivos = Array.from(saldoPorDeudor.entries()).filter(([, saldo]) => saldo > 0)

  const totalAdeudado = saldosPositivos.reduce((acc, [, saldo]) => acc + saldo, 0)
  const cantidadDeudoresActivos = saldosPositivos.length

  const todosLosDeudores = saldosPositivos
    .map(([id, saldo]) => ({ nombre: nombrePorId.get(id) ?? '—', saldo }))
    .sort((a, b) => b.saldo - a.saldo)

  const topDeudores = todosLosDeudores.slice(0, 5)

  const hoy = new Date()

  const inicioActual = inicioDeSemana(hoy)
  const semanasArr: Date[] = []
  for (let i = semanas - 1; i >= 0; i--) {
    const d = new Date(inicioActual)
    d.setDate(d.getDate() - i * 7)
    semanasArr.push(d)
  }
  const tendenciaSemanal: PuntoTendencia[] = semanasArr.map((inicioSemana) => {
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(finSemana.getDate() + 7)
    const totalDeuda = movs
      .filter((m) => new Date(m.created_at) < finSemana)
      .reduce((acc, m) => acc + (m.tipo === 'DEUDA' ? Number(m.monto) : -Number(m.monto)), 0)
    return { etiqueta: etiquetaSemana(inicioSemana), totalDeuda: Math.max(0, totalDeuda) }
  })

  const diasArr: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const finDia = new Date(hoy)
    finDia.setDate(finDia.getDate() - i)
    finDia.setHours(23, 59, 59, 999)
    diasArr.push(finDia)
  }
  const tendenciaDiaria: PuntoTendencia[] = diasArr.map((finDia) => {
    const totalDeuda = movs
      .filter((m) => new Date(m.created_at) <= finDia)
      .reduce((acc, m) => acc + (m.tipo === 'DEUDA' ? Number(m.monto) : -Number(m.monto)), 0)
    return { etiqueta: etiquetaDia(finDia), totalDeuda: Math.max(0, totalDeuda) }
  })

  return { totalAdeudado, cantidadDeudoresActivos, topDeudores, todosLosDeudores, tendenciaSemanal, tendenciaDiaria }
}