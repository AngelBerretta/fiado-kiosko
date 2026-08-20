'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  datos: { etiqueta: string; totalDeuda: number }[]
}

export default function GraficoDeudaTotal({ datos }: Props) {
  if (datos.length === 0) {
    return (
      <p style={{ color: 'var(--color-ink-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
        Todavía no hay datos suficientes
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={datos} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1F3A93" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#1F3A93" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="etiqueta" fontSize={11} stroke="var(--color-ink-muted)" />
        <YAxis fontSize={11} stroke="var(--color-ink-muted)" tickFormatter={(v: number) => `$${v.toLocaleString('es-AR')}`} />
        <Tooltip
          formatter={(value) => {
            const numero = typeof value === 'number' ? value : Number(value ?? 0)
            return [`$${numero.toLocaleString('es-AR')}`, 'Deuda total']
          }}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }}
        />
        <Area type="monotone" dataKey="totalDeuda" stroke="#1F3A93" fill="url(#colorDeuda)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}