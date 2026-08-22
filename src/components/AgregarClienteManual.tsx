'use client'

import { useState } from 'react'

interface ClienteExistente {
  id: string
  nombre: string
  telefono: string | null
}

interface Props {
  slug: string
  clienteExistente?: ClienteExistente
  onClienteCreado: (mensaje: string) => void
  onCancelar: () => void
}

export default function AgregarClienteManual({ slug, clienteExistente, onClienteCreado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(clienteExistente?.nombre ?? '')
  const [telefono, setTelefono] = useState(clienteExistente?.telefono ?? '')
  const [monto, setMonto] = useState('')
  const [detalle, setDetalle] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esParaClienteExistente = !!clienteExistente

  const guardar = async () => {
    if (!nombre.trim()) {
      setError('Ingresá un nombre')
      return
    }
    setError('')
    setGuardando(true)
    try {
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

      const montoNum = Number(monto)
      let deudaGuardada = false
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
          setError(`Cliente guardado pero la deuda no se pudo registrar: ${dataMovimiento.error}`)
          return
        }
        deudaGuardada = true
      }

      const mensaje = deudaGuardada
        ? `Fiado de $${montoNum.toLocaleString('es-AR')} agregado a ${nombre.trim()}`
        : dataDeudor.yaExistia
          ? 'Ese cliente ya estaba registrado'
          : 'Cliente agregado'
      onClienteCreado(mensaje)
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="agregar-cliente" role="group" aria-label={esParaClienteExistente ? `Agregar fiado a ${clienteExistente!.nombre}` : 'Agregar cliente a mano'}>
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="ac-nombre" className="agregar-cliente__label">Nombre</label>
        <input
          id="ac-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej: Roberto Gómez"
          className="agregar-cliente__input"
          disabled={esParaClienteExistente}
          autoFocus={!esParaClienteExistente}
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

      <div style={{ background: 'var(--color-rojo-soft)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-rojo)' }}>
          {esParaClienteExistente ? 'Anotar fiado' : '¿Anotar fiado ahora? (opcional)'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
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
              autoFocus={esParaClienteExistente}
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
          {guardando ? 'Guardando…' : esParaClienteExistente ? 'Guardar fiado' : monto ? 'Guardar cliente y deuda' : 'Guardar cliente'}
        </button>
        <button onClick={onCancelar} className="btn-secundario" style={{ padding: '10px 16px', fontSize: 14 }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}