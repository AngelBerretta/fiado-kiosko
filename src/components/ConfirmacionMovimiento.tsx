'use client'

import { useState, useEffect } from 'react'

interface Accion {
  intencion: 'AGREGAR_DEUDA' | 'PAGAR_DEUDA' | 'CONSULTAR_SALDO' | 'DESCONOCIDA'
  nombre: string
  monto: number | null
  detalle: string | null
}

interface Props {
  accion: Accion
  nombresExistentes: string[]
  onConfirmar: (accionCorregida: Accion) => void
  onCancelar: () => void
}

const ETIQUETAS_INTENCION: Record<Accion['intencion'], string> = {
  AGREGAR_DEUDA: '➕ Agregar deuda',
  PAGAR_DEUDA: '💰 Registrar pago',
  CONSULTAR_SALDO: '🔍 Consultar saldo',
  DESCONOCIDA: '❓ No se entendió',
}

export default function ConfirmacionMovimiento({
  accion,
  nombresExistentes,
  onConfirmar,
  onCancelar,
}: Props) {
  const [editado, setEditado] = useState<Accion>(accion)

  useEffect(() => setEditado(accion), [accion])

  const esNombreNuevo = editado.nombre && !nombresExistentes.includes(editado.nombre)

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, marginTop: 16, borderRadius: 8 }}>
      <h3>{ETIQUETAS_INTENCION[editado.intencion]}</h3>

      <label>Intención:</label>
      <select
        value={editado.intencion}
        onChange={(e) => setEditado({ ...editado, intencion: e.target.value as Accion['intencion'] })}
        style={{ display: 'block', width: '100%', marginBottom: 8 }}
      >
        {Object.entries(ETIQUETAS_INTENCION).map(([valor, etiqueta]) => (
          <option key={valor} value={valor}>{etiqueta}</option>
        ))}
      </select>

      <label>Nombre:</label>
      <input
        value={editado.nombre ?? ''}
        onChange={(e) => setEditado({ ...editado, nombre: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 4 }}
        list="nombres-existentes"
      />
      <datalist id="nombres-existentes">
        {nombresExistentes.map((n) => <option key={n} value={n} />)}
      </datalist>
      {esNombreNuevo && (
        <p style={{ fontSize: 12, color: '#b45309', margin: '4px 0' }}>
          ⚠️ Este deudor no existe todavía, se va a crear uno nuevo.
        </p>
      )}

      {editado.intencion !== 'CONSULTAR_SALDO' && (
        <>
          <label>Monto:</label>
          <input
            type="number"
            value={editado.monto ?? ''}
            onChange={(e) => setEditado({ ...editado, monto: e.target.value ? Number(e.target.value) : null })}
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />

          <label>Detalle:</label>
          <input
            value={editado.detalle ?? ''}
            onChange={(e) => setEditado({ ...editado, detalle: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => onConfirmar(editado)}>✅ Confirmar</button>
        <button onClick={onCancelar}>✖️ Cancelar</button>
      </div>
    </div>
  )
}