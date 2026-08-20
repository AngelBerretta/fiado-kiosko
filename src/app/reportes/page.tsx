'use client'

import { useEffect, useState } from 'react'
import { useKioscoSlug } from '@/lib/useKiosco'
import GraficoTopDeudores from '@/components/GraficoTopDeudores'
import GraficoDeudaTotal from '@/components/GraficoDeudaTotal'
import ResumenCartera from '@/components/ResumenCartera'
import ExportarResumenWhatsapp from '@/components/ExportarResumenWhatsapp'
import AppShell from '@/components/AppShell'
import { DatosReportes } from '@/lib/reportes'

export default function Reportes() {
  const { slug, cargando: cargandoSlug } = useKioscoSlug()
  const [datos, setDatos] = useState<DatosReportes | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargandoSlug || !slug) return
    fetch(`/api/reportes?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error cargando reportes')
        setDatos(data)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los reportes')
      })
      .finally(() => setCargando(false))
  }, [slug, cargandoSlug])

  return (
    <AppShell>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 20px' }}>Reportes</h1>

      {(cargando || cargandoSlug) && <p style={{ color: 'var(--color-ink-muted)' }}>Cargando…</p>}
      {error && <p style={{ color: 'var(--color-rojo)' }}>{error}</p>}

      {datos && (
        <>
          <ResumenCartera
            totalAdeudado={datos.totalAdeudado}
            cantidadDeudores={datos.cantidadDeudoresActivos}
            etiquetaMonto="Total adeudado"
            etiquetaCantidad="Deudores activos"
          />

          <div style={{ marginBottom: 16 }}>
            <ExportarResumenWhatsapp datos={datos} />
          </div>

          <div className="reportes__graficos">
            <section className="card">
              <h2 className="reportes__titulo-grafico">Evolución de deuda (7 días)</h2>
              <GraficoDeudaTotal datos={datos.tendenciaDiaria} />
            </section>

            <section className="card">
              <h2 className="reportes__titulo-grafico">Top 5 deudores</h2>
              <GraficoTopDeudores datos={datos.topDeudores} />
            </section>
          </div>
        </>
      )}
    </AppShell>
  )
}