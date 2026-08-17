import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: deudores, error } = await supabase
    .from('deudores')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Deudores</h1>
      <ul>
        {deudores?.map((d) => (
          <li key={d.id}>{d.nombre} — {d.telefono ?? 'sin teléfono'}</li>
        ))}
      </ul>
    </main>
  )
}