'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import ListaDeudores from '@/components/ListaDeudores'
import ResumenCartera from '@/components/ResumenCartera'
import AppShell from '@/components/AppShell'
import { useKioscoSlug } from '@/lib/useKiosco'
import { borrarSlug } from '@/lib/kiosco-client'
import { DeudorConSaldo } from '@/lib/saldos'

export default function Home() {
  const router = useRouter()
  const { slug, cargando: cargandoSlug } = useKioscoSlug()
  const [deudores, setDeudores] = useState<DeudorConSaldo[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarDeudores = useCallback(() => {
    if (!slug) return
    fetch(`/api/deudores?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setDeudores(data.deudores ?? []))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false))
  }, [slug])

  useEffect(() => {
    if (cargandoSlug || !slug) return
    cargarDeudores()
  }, [slug, cargandoSlug, cargarDeudores])

  const cambiarKiosco = () => {
    borrarSlug()
    router.replace('/acceso')
  }

  if (cargandoSlug || !slug || cargando) {
    return (
      <AppShell>
        <p style={{ color: 'var(--color-ink-muted)' }}>Cargando…</p>
      </AppShell>
    )
  }

  const conDeuda = deudores.filter((d) => d.saldo > 0)
  const totalAdeudado = conDeuda.reduce((acc, d) => acc + d.saldo, 0)

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Fiado</h1>
        <button
          onClick={cambiarKiosco}
          aria-label="Cambiar de kiosco"
          style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <LogOut size={20} />
        </button>
      </div>

      {slug === 'demo-jurado' && (
        <div className="chip" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)', marginBottom: 16 }}>
          🧪 Estás viendo datos de demostración
        </div>
      )}

      <ResumenCartera totalAdeudado={totalAdeudado} cantidadDeudores={conDeuda.length} />

      <ListaDeudores deudores={deudores} orden="saldo" slug={slug} onClienteAgregado={cargarDeudores} />
    </AppShell>
  )
}