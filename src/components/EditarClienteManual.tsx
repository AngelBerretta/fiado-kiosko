'use client'

import { useState } from 'react'
import { DeudorConSaldo } from '@/lib/saldos'

interface Props {
  cliente: DeudorConSaldo
  onGuardado: (mensaje: string) => void
  onEliminado: () => void
  onCancelar: () => void
}

export default function EditarClienteManual({ cliente, onGuardado, onEliminado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(cliente.nombre)
  const [telefono, setTelefono] = useState(cliente.telefono ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [pidiendoConfirmacionBorrado, setPidiendoConfirmacionBorrado] = useState(false)
  const [avisoBorrado, setAvisoBorrado] = useState('')
  const [borrando, setBorrando] = useState(false)

  const guardar = async () => {
    if (!nombre.trim()) {
      setError('Ingresá un nombre')
      return
    }
    setError('')
    setGuardando(true)
    try {
      const res = await fetch(`/api/deudores/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'No se pudo guardar'); return }
      onGuardado('Cliente actualizado')
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (forzar: boolean) => {
    setBorrando(true)
    setError('')
    try {
      const url = forzar ? `/api/deudores/${cliente.id}?confirmarBorrarHistorial=true` : `/api/deudores/${cliente.id}`
      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()
      if (res.status === 409 && data.tieneHistorial) {
        setAvisoBorrado(data.error)
        setPidiendoConfirmacionBorrado(true)
        return
      }
      if (!res.ok) { setError(data.error ?? 'No se pudo eliminar'); return }
      onEliminado()
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="agregar-cliente" role="group" aria-label={`Editar a ${cliente.nombre}`}>
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="ec-nombre" className="agregar-cliente__label">Nombre</label>
        <input id="ec-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="agregar-cliente__input" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="ec-telefono" className="agregar-cliente__label">Teléfono (opcional, para WhatsApp)</label>
        <input id="ec-telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="ej: 5491122334455" className="agregar-cliente__input" />
      </div>

      {error && <p role="alert" style={{ color: 'var(--color-rojo)', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={guardar} disabled={guardando} className="btn-primario" style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button onClick={onCancelar} className="btn-secundario" style={{ padding: '10px 16px', fontSize: 14 }}>
          Cancelar
        </button>
      </div>

      {pidiendoConfirmacionBorrado && (
        <div style={{ fontSize: 13, color: 'var(--color-rojo)', background: 'var(--color-rojo-soft)', padding: 10, borderRadius: 8, marginBottom: 10, lineHeight: 1.5 }}>
          {avisoBorrado} ¿Confirmás igual?
        </div>
      )}

      <button
        onClick={() => eliminar(pidiendoConfirmacionBorrado)}
        disabled={borrando}
        className="boton-eliminar-cliente"
      >
        {borrando ? 'Eliminando…' : pidiendoConfirmacionBorrado ? 'Sí, eliminar de todas formas' : 'Eliminar cliente'}
      </button>
    </div>
  )
}