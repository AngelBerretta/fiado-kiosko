'use client'

import { useState, useEffect, useRef } from 'react'

interface Accion {
  intencion: 'AGREGAR_DEUDA' | 'PAGAR_DEUDA' | 'CONSULTAR_SALDO' | 'DESCONOCIDA'
  nombre: string
  monto: number | null
  detalle: string | null
}

interface Props {
  accion: Accion
  nombresExistentes: string[]
  slug: string
  onConfirmar: (accionCorregida: Accion, confirmarSobrepago: boolean) => void
  onCancelar: () => void
}

const ETIQUETAS_INTENCION: Record<Accion['intencion'], string> = {
  AGREGAR_DEUDA: 'Agregar deuda',
  PAGAR_DEUDA: 'Registrar pago',
  CONSULTAR_SALDO: 'Consultar saldo',
  DESCONOCIDA: 'No se entendió',
}

export default function ConfirmacionMovimiento({ accion, nombresExistentes, slug, onConfirmar, onCancelar }: Props) {
  const [editado, setEditado] = useState<Accion>(accion)
  const [saldoActual, setSaldoActual] = useState<number | null>(null)
  const [cargandoSaldo, setCargandoSaldo] = useState(false)
  const [pidiendoConfirmacionSobrepago, setPidiendoConfirmacionSobrepago] = useState(false)
  const nombreInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditado(accion)
    setPidiendoConfirmacionSobrepago(false)
    if (!accion.nombre?.trim()) {
      requestAnimationFrame(() => nombreInputRef.current?.focus())
    }
  }, [accion])

  // Busca el saldo cada vez que cambia el nombre (con debounce), tanto en la carga inicial
  // como si el kiosquero escribe el nombre a mano (ej: cuando vino vacío de la interpretación).
  useEffect(() => {
    const nombre = editado.nombre?.trim()
    if (!nombre) { setSaldoActual(null); return }

    setCargandoSaldo(true)
    const timeoutId = setTimeout(() => {
      fetch(`/api/saldo?nombre=${encodeURIComponent(nombre)}&slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((data) => setSaldoActual(data.existe ? data.saldo : 0))
        .catch(() => setSaldoActual(null))
        .finally(() => setCargandoSaldo(false))
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [editado.nombre, slug])

  const nombreFaltante = !editado.nombre?.trim()
  const esNombreNuevo = !nombreFaltante && !nombresExistentes.includes(editado.nombre)
  const esPago = editado.intencion === 'PAGAR_DEUDA'
  const colorIntencion = esPago ? 'var(--color-verde)' : 'var(--color-rojo)'
  const esSobrepago = esPago && saldoActual !== null && (editado.monto ?? 0) > saldoActual
  const nuevoSaldo = editado.monto !== null && saldoActual !== null
    ? (esPago ? saldoActual - Math.min(editado.monto, saldoActual) : saldoActual + editado.monto)
    : null

  const puedeConfirmar = !nombreFaltante && editado.monto !== null && editado.monto > 0

  const handleConfirmarClick = () => {
    if (nombreFaltante) { nombreInputRef.current?.focus(); return }
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
        ref={nombreInputRef}
        value={editado.nombre ?? ''}
        onChange={(e) => setEditado({ ...editado, nombre: e.target.value })}
        list="nombres-existentes"
        placeholder="Escribí el nombre del cliente"
        style={{
          display: 'block', width: '100%', borderRadius: 8, padding: 8, marginBottom: 4, fontSize: 16,
          border: nombreFaltante ? '1.5px solid var(--color-rojo)' : '1px solid var(--color-border)',
        }}
      />
      <datalist id="nombres-existentes">
        {nombresExistentes.map((n) => <option key={n} value={n} />)}
      </datalist>
      {nombreFaltante && (
        <p role="alert" style={{ fontSize: 12, color: 'var(--color-rojo)', margin: '4px 0 12px' }}>
          Falta el nombre — escribilo para poder confirmar
        </p>
      )}
      {esNombreNuevo && <p style={{ fontSize: 12, color: 'var(--color-rojo)', margin: '4px 0 12px' }}>Cliente nuevo, se va a crear.</p>}

      {editado.intencion !== 'CONSULTAR_SALDO' && (
        <>
          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Monto</label>
          <input
            type="number"
            className="monto"
            value={editado.monto ?? ''}
            onChange={(e) => setEditado({ ...editado, monto: e.target.value ? Number(e.target.value) : null })}
            style={{ display: 'block', width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, marginBottom: 4, fontSize: 18 }}
          />
          {editado.monto !== null && editado.monto > 0 && (
            <p className="monto" style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 12px' }}>
              ${editado.monto.toLocaleString('es-AR')}
            </p>
          )}
        </>
      )}

      {!nombreFaltante && saldoActual !== null && !cargandoSaldo && (
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Saldo actual</span>
          <span className="monto">${saldoActual.toLocaleString('es-AR')}</span>
        </div>
      )}
      {!nombreFaltante && nuevoSaldo !== null && !cargandoSaldo && (
        <div style={{ fontSize: 13, color: 'var(--color-ink)', fontWeight: 600, margin: '0 0 12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Saldo después</span>
          <span className="monto">${nuevoSaldo.toLocaleString('es-AR')}</span>
        </div>
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
        <button onClick={handleConfirmarClick} disabled={!puedeConfirmar} className="btn-primario" style={{ flex: 1 }}>
          {pidiendoConfirmacionSobrepago ? 'Sí, dejar saldo en $0' : 'Confirmar'}
        </button>
        <button onClick={onCancelar} className="btn-secundario">Cancelar</button>
      </div>
    </div>
  )
}