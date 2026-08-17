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

function etiquetaTiempo(dias: number) {
  if (dias === Infinity) return ''
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'hace 1 día'
  return `hace ${dias} días`
}

export default function ListaDeudores({ deudores, orden = 'saldo' }: Props) {
  const conDeuda = deudores.filter((d) => d.saldo > 0)
  const ordenados = [...conDeuda].sort((a, b) =>
    orden === 'saldo' ? b.saldo - a.saldo : diasSinPagar(b.ultimoMovimiento) - diasSinPagar(a.ultimoMovimiento)
  )

  if (ordenados.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-ink-muted)' }}>
        No hay deudores con saldo pendiente
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '4px 20px' }}>
      {ordenados.map((d, i) => (
        <div
          key={d.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < ordenados.length - 1 ? '1px dashed var(--color-border)' : 'none',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{d.nombre}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-ink-muted)' }}>
              {etiquetaTiempo(diasSinPagar(d.ultimoMovimiento))}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="monto" style={{ fontSize: 15, color: 'var(--color-rojo)' }}>
              ${d.saldo.toLocaleString('es-AR')}
            </span>
            {d.telefono && <BotonWhatsapp telefono={d.telefono} nombre={d.nombre} saldo={d.saldo} />}
          </div>
        </div>
      ))}
    </div>
  )
}