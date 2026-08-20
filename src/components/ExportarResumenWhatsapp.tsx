'use client'

import { FileSpreadsheet, ChevronRight } from 'lucide-react'
import { DatosReportes } from '@/lib/reportes'

interface Props { datos: DatosReportes }

const MAX_ITEMS_EN_MENSAJE = 60

export default function ExportarResumenWhatsapp({ datos }: Props) {
  const compartir = () => {
    const lista = datos.todosLosDeudores
    const listaRecortada = lista.slice(0, MAX_ITEMS_EN_MENSAJE)
    const lineas = [
      '📋 Resumen de fiado',
      `Total adeudado: $${datos.totalAdeudado.toLocaleString('es-AR')}`,
      `Deudores activos: ${datos.cantidadDeudoresActivos}`,
      '',
      'Detalle por cliente:',
      ...listaRecortada.map((d, i) => `${i + 1}. ${d.nombre} — $${d.saldo.toLocaleString('es-AR')}`),
      ...(lista.length > MAX_ITEMS_EN_MENSAJE ? [`… y ${lista.length - MAX_ITEMS_EN_MENSAJE} más.`] : []),
    ]
    const texto = encodeURIComponent(lineas.join('\n'))
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  return (
    <button onClick={compartir} className="tarjeta-exportar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="tarjeta-exportar__icono"><FileSpreadsheet size={18} /></div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Exportar resumen</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-ink-muted)' }}>
            Enviar lista completa de {datos.cantidadDeudoresActivos} {datos.cantidadDeudoresActivos === 1 ? 'cliente' : 'clientes'} por WhatsApp
          </p>
        </div>
      </div>
      <ChevronRight size={16} color="var(--color-accent)" />
    </button>
  )
}