'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useKioscoSlug } from '@/lib/useKiosco'
import GraficoTopDeudores from '@/components/GraficoTopDeudores'
import GraficoDeudaTotal from '@/components/GraficoDeudaTotal'
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
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-ink-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Volver
      </Link>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '12px 0 24px' }}>Reportes</h1>

      {(cargando || cargandoSlug) && <p style={{ color: 'var(--color-ink-muted)' }}>Cargando…</p>}
      {error && <p style={{ color: 'var(--color-rojo)' }}>{error}</p>}

      {datos && (
        <>
          <div className="card borde-ticket-abajo" style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 4px' }}>Total adeudado</p>
            <p className="monto" style={{ fontSize: 28, margin: 0, color: datos.totalAdeudado > 0 ? 'var(--color-rojo)' : 'var(--color-verde)' }}>
              ${datos.totalAdeudado.toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', margin: '6px 0 0' }}>
              {datos.cantidadDeudoresActivos} {datos.cantidadDeudoresActivos === 1 ? 'deudor activo' : 'deudores activos'}
            </p>
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Top deudores</h2>
          <div className="card" style={{ marginBottom: 32 }}>
            <GraficoTopDeudores datos={datos.topDeudores} />
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Tendencia semanal</h2>
          <div className="card">
            <GraficoDeudaTotal datos={datos.tendenciaSemanal} />
          </div>
        </>
      )}
    </main>
  )
}