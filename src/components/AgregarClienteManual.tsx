'use client'

import { useState } from 'react'

interface Props {
  slug: string
  onClienteCreado: () => void
  onCancelar: () => void
}

export default function AgregarClienteManual({ slug, onClienteCreado, onCancelar }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [monto, setMonto] = useState('')
  const [detalle, setDetalle] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const guardar = async () => {
    if (!nombre.trim()) {
      setError('Ingresá un nombre')
      return
    }
    setError('')
    setGuardando(true)
    try {
      // 1. Crear el deudor
      const resDeudor = await fetch('/api/deudores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, slug }),
      })
      const dataDeudor = await resDeudor.json()

      if (!resDeudor.ok) {
        setError(dataDeudor.error ?? 'No se pudo agregar el cliente')
        return
      }

      // 2. Si hay monto, registrar la deuda
      const montoNum = Number(monto)
      if (monto && montoNum > 0) {
        const resMovimiento = await fetch('/api/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombre.trim(),
            intencion: 'AGREGAR_DEUDA',
            monto: montoNum,
            detalle: detalle?.trim() || null,
            confirmarSobrepago: false,
            slug,
          }),
        })
        const dataMovimiento = await resMovimiento.json()

        if (!resMovimiento.ok) {
          setError(`Cliente creado pero la deuda no se guardó: ${dataMovimiento.error}`)
          return
        }
      }

      onClienteCreado()
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="agregar-cliente" role="group" aria-label="Agregar cliente a mano">
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="ac-nombre" className="agregar-cliente__label">Nombre</label>
        <input
          id="ac-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej: Roberto Gómez"
          className="agregar-cliente__input"
          autoFocus
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="ac-telefono" className="agregar-cliente__label">Teléfono (opcional, para WhatsApp)</label>
        <input
          id="ac-telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="ej: 5491122334455"
          className="agregar-cliente__input"
        />
      </div>

      {/* Bloque de deuda inicial */}
      <div style={{
        background: 'var(--color-rojo-soft)',
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-rojo)' }}>
          ¿Anotar fiado ahora? (opcional)
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="ac-monto" className="agregar-cliente__label">Monto</label>
            <input
              id="ac-monto"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="ej: 500"
              className="agregar-cliente__input"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label htmlFor="ac-detalle" className="agregar-cliente__label">Detalle</label>
            <input
              id="ac-detalle"
              type="text"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="ej: Cigarrillos y gaseosa"
              className="agregar-cliente__input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {error && <p role="alert" style={{ color: 'var(--color-rojo)', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={guardar} disabled={guardando} className="btn-primario" style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}>
          {guardando ? 'Guardando…' : monto ? 'Guardar cliente y deuda' : 'Guardar cliente'}
        </button>
        <button onClick={onCancelar} className="btn-secundario" style={{ padding: '10px 16px', fontSize: 14 }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}