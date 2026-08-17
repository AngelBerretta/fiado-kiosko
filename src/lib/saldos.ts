import { supabase } from './supabase'

export interface DeudorConSaldo {
  id: string
  nombre: string
  telefono: string | null
  saldo: number
  ultimoMovimiento: string | null // fecha ISO
}

export async function obtenerDeudoresConSaldo(): Promise<DeudorConSaldo[]> {
  const { data: deudores, error: errorDeudores } = await supabase
    .from('deudores')
    .select('id, nombre, telefono')

  if (errorDeudores || !deudores) {
    console.error('Error trayendo deudores:', errorDeudores)
    return []
  }

  const { data: movimientos, error: errorMovimientos } = await supabase
    .from('movimientos')
    .select('deudor_id, tipo, monto, created_at')

  if (errorMovimientos) {
    console.error('Error trayendo movimientos:', errorMovimientos)
  }

  return deudores.map((d) => {
    const movsDelDeudor = movimientos?.filter((m) => m.deudor_id === d.id) ?? []

    const saldo = movsDelDeudor.reduce((acc, m) => {
      return m.tipo === 'DEUDA' ? acc + Number(m.monto) : acc - Number(m.monto)
    }, 0)

    const ultimoMovimiento = movsDelDeudor.length > 0
      ? movsDelDeudor.reduce((ultimo, m) =>
          new Date(m.created_at) > new Date(ultimo) ? m.created_at : ultimo, movsDelDeudor[0].created_at)
      : null

    return { id: d.id, nombre: d.nombre, telefono: d.telefono, saldo, ultimoMovimiento }
  })
}