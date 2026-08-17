import { DeudorConSaldo } from '@/lib/saldos'
import BotonWhatsapp from './BotonWhatsapp'

interface Props {
  deudores: DeudorConSaldo[]
  orden?: 'saldo' | 'antiguedad'
}

function diasSinPagar(fecha: string | null): number {
  if (!fecha) return Infinity
  return Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
}

export default function ListaDeudores({ deudores, orden = 'saldo' }: Props) {
  const conDeuda = deudores.filter((d) => d.saldo > 0)

  const ordenados = [...conDeuda].sort((a, b) => {
    if (orden === 'saldo') return b.saldo - a.saldo
    return diasSinPagar(b.ultimoMovimiento) - diasSinPagar(a.ultimoMovimiento)
  })

  if (ordenados.length === 0) {
    return <p>No hay deudores con saldo pendiente 🎉</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {ordenados.map((d) => (
        <li key={d.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
          <strong>{d.nombre}</strong> — ${d.saldo.toLocaleString('es-AR')}
          <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
            {diasSinPagar(d.ultimoMovimiento) === Infinity
              ? ''
              : `hace ${diasSinPagar(d.ultimoMovimiento)} día(s)`}
          </span>
          {d.telefono && <BotonWhatsapp telefono={d.telefono} nombre={d.nombre} saldo={d.saldo} />}
        </li>
      ))}
    </ul>
  )
}