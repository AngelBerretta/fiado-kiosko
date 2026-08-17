import { obtenerDeudoresConSaldo } from '@/lib/saldos'
import ListaDeudores from '@/components/ListaDeudores'
import Link from 'next/link'
import { Mic } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const deudores = await obtenerDeudoresConSaldo()
  const conDeuda = deudores.filter((d) => d.saldo > 0)
  const totalAdeudado = conDeuda.reduce((acc, d) => acc + d.saldo, 0)

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 20px' }}>Fiado</h1>

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