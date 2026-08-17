import { obtenerDeudoresConSaldo } from '@/lib/saldos'
import ListaDeudores from '@/components/ListaDeudores'

export default async function Home() {
  const deudores = await obtenerDeudoresConSaldo()
  const totalAdeudado = deudores.reduce((acc, d) => acc + d.saldo, 0)

  return (
    <main style={{ padding: 24 }}>
      <h1>Fiado — Dashboard</h1>
      <p>Total adeudado: <strong>${totalAdeudado.toLocaleString('es-AR')}</strong></p>
      <ListaDeudores deudores={deudores} orden="saldo" />
      <a href="/grabar" style={{ display: 'block', marginTop: 24 }}>🎙️ Registrar movimiento</a>
    </main>
  )
}