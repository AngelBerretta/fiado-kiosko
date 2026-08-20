import { HandCoins, Users } from 'lucide-react'

interface Props {
  totalAdeudado: number
  cantidadDeudores: number
  etiquetaMonto?: string
  etiquetaCantidad?: string
}

export default function ResumenCartera({
  totalAdeudado,
  cantidadDeudores,
  etiquetaMonto = 'Por cobrar',
  etiquetaCantidad = 'Deudores',
}: Props) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <span className="kpi-card__icono kpi-card__icono--rojo"><HandCoins size={13} /></span>
        <span className="kpi-card__etiqueta">{etiquetaMonto}</span>
        <p className="kpi-card__valor monto" style={{ color: 'var(--color-rojo)' }}>
          ${totalAdeudado.toLocaleString('es-AR')}
        </p>
      </div>
      <div className="kpi-card">
        <span className="kpi-card__icono kpi-card__icono--azul"><Users size={13} /></span>
        <span className="kpi-card__etiqueta">{etiquetaCantidad}</span>
        <p className="kpi-card__valor">{cantidadDeudores}</p>
      </div>
    </div>
  )
}