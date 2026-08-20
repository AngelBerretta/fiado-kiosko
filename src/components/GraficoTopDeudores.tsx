'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  datos: { nombre: string; saldo: number }[]
}

const COLORES = ['#B3401F', '#C2521F', '#D06B2A', '#DE8639', '#E8A34E']

export default function GraficoTopDeudores({ datos }: Props) {
  if (datos.length === 0) {
    return (
      <p style={{ color: 'var(--color-ink-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
        Sin deudores con saldo pendiente
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v: number) => `$${v.toLocaleString('es-AR')}`} fontSize={11} stroke="var(--color-ink-muted)" />
        <YAxis type="category" dataKey="nombre" width={90} fontSize={12} stroke="var(--color-ink-muted)" />
        <Tooltip
          formatter={(value) => {
            const numero = typeof value === 'number' ? value : Number(value ?? 0)
            return [`$${numero.toLocaleString('es-AR')}`, 'Debe']
          }}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }}
        />
        <Bar dataKey="saldo" radius={[0, 6, 6, 0]}>
          {datos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}