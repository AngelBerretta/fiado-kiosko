'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mic, BarChart3, LogOut } from 'lucide-react'
import ListaDeudores from '@/components/ListaDeudores'
import { useKioscoSlug } from '@/lib/useKiosco'
import { borrarSlug } from '@/lib/kiosco-client'
import { DeudorConSaldo } from '@/lib/saldos'

export default function Home() {
  const router = useRouter()
  const { slug, cargando: cargandoSlug } = useKioscoSlug()
  const [deudores, setDeudores] = useState<DeudorConSaldo[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (cargandoSlug || !slug) return
    fetch(`/api/deudores?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setDeudores(data.deudores ?? []))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false))
  }, [slug, cargandoSlug])

  const cambiarKiosco = () => {
    borrarSlug()
    router.replace('/acceso')
  }

  if (cargandoSlug || !slug || cargando) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
        <p style={{ color: 'var(--color-ink-muted)' }}>Cargando…</p>
      </main>
    )
  }

  const conDeuda = deudores.filter((d) => d.saldo > 0)
  const totalAdeudado = conDeuda.reduce((acc, d) => acc + d.saldo, 0)

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Fiado</h1>
        {slug === 'demo-jurado' && (
          <div className="chip" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)', marginBottom: 16, display: 'inline-flex' }}>
            🧪 Estás viendo datos de demostración
          </div>
        )}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Link href="/reportes" aria-label="Reportes" style={{ color: 'var(--color-ink-muted)', display: 'flex' }}>
            <BarChart3 size={20} />
          </Link>
          <button
            onClick={cambiarKiosco}
            aria-label="Cambiar de kiosco"
            style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="card borde-ticket-abajo" style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 4px' }}>Total adeudado</p>
        <p className="monto" style={{ fontSize: 28, margin: 0, color: totalAdeudado > 0 ? 'var(--color-rojo)' : 'var(--color-verde)' }}>
          ${totalAdeudado.toLocaleString('es-AR')}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', margin: '6px 0 0' }}>
          {conDeuda.length} {conDeuda.length === 1 ? 'deudor activo' : 'deudores activos'}
        </p>
      </div>

      <ListaDeudores deudores={deudores} orden="saldo" />

      <Link
        href="/grabar"
        className="btn-primario"
        style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', textDecoration: 'none', boxShadow: '0 4px 14px rgba(20,23,31,0.18)' }}
      >
        <Mic size={18} /> Registrar por voz
      </Link>
    </main>
  )
}