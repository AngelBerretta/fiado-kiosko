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
  saldoActual: number | null
  onConfirmar: (accionCorregida: Accion, confirmarSobrepago: boolean) => void
  onCancelar: () => void
}

const ETIQUETAS_INTENCION: Record<Accion['intencion'], string> = {
  AGREGAR_DEUDA: 'Agregar deuda',
  PAGAR_DEUDA: 'Registrar pago',
  CONSULTAR_SALDO: 'Consultar saldo',
  DESCONOCIDA: 'No se entendió',
}

export default function ConfirmacionMovimiento({ accion, nombresExistentes, saldoActual, onConfirmar, onCancelar }: Props) {
  const [editado, setEditado] = useState<Accion>(accion)
  const [pidiendoConfirmacionSobrepago, setPidiendoConfirmacionSobrepago] = useState(false)

  useEffect(() => {
    setEditado(accion)
    setPidiendoConfirmacionSobrepago(false)
  }, [accion])

  const esNombreNuevo = editado.nombre && !nombresExistentes.includes(editado.nombre)
  const esPago = editado.intencion === 'PAGAR_DEUDA'
  const colorIntencion = esPago ? 'var(--color-verde)' : 'var(--color-rojo)'
  const esSobrepago = esPago && saldoActual !== null && (editado.monto ?? 0) > saldoActual

  const handleConfirmarClick = () => {
    if (esSobrepago && !pidiendoConfirmacionSobrepago) {
      setPidiendoConfirmacionSobrepago(true)
      return
    }
    onConfirmar(editado, esSobrepago)
  }

  return (
    <div className="card borde-ticket-arriba">
      <span style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: colorIntencion, fontWeight: 600, display: 'block', marginBottom: 14 }}>
        {ETIQUETAS_INTENCION[editado.intencion]}
      </span>

      <label style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Nombre</label>
      <input
        value={editado.nombre ?? ''}
        onChange={(e) => setEditado({ ...editado, nombre: e.target.value })}
        list="nombres-existentes"
        style={{ display: 'block', width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, marginBottom: 4, fontSize: 15 }}
      />
      <datalist id="nombres-existentes">
        {nombresExistentes.map((n) => <option key={n} value={n} />)}
      </datalist>
      {esNombreNuevo && <p style={{ fontSize: 12, color: 'var(--color-rojo)', margin: '4px 0 12px' }}>Deudor nuevo, se va a crear.</p>}

      {editado.intencion !== 'CONSULTAR_SALDO' && (
        <>
          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Monto</label>
          <input
            type="number"
            className="monto"
            value={editado.monto ?? ''}
            onChange={(e) => setEditado({ ...editado, monto: e.target.value ? Number(e.target.value) : null })}
            style={{ display: 'block', width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, marginBottom: 12, fontSize: 16 }}
          />
        </>
      )}

      {esPago && saldoActual !== null && (
        <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 8px' }}>
          Saldo actual: <span className="monto">${saldoActual.toLocaleString('es-AR')}</span>
        </p>
      )}

      {esSobrepago && (
        <div style={{ fontSize: 13, color: 'var(--color-rojo)', background: 'var(--color-rojo-soft)', padding: 10, borderRadius: 8, marginBottom: 12, lineHeight: 1.5 }}>
          <strong>{editado.nombre} debe ${saldoActual?.toLocaleString('es-AR')}</strong>, el pago es de ${(editado.monto ?? 0).toLocaleString('es-AR')}.
          {pidiendoConfirmacionSobrepago
            ? ` Se va a registrar $${saldoActual?.toLocaleString('es-AR')}, el saldo queda en $0.`
            : ' Confirmá de nuevo si está bien.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleConfirmarClick} className="btn-primario" style={{ flex: 1 }}>
          {pidiendoConfirmacionSobrepago ? 'Sí, dejar saldo en $0' : 'Confirmar'}
        </button>
        <button onClick={onCancelar} className="btn-secundario">Cancelar</button>
      </div>
    </div>
  )
}