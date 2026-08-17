'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import GrabadorAudio from '@/components/GrabadorAudio'
import ConfirmacionMovimiento from '@/components/ConfirmacionMovimiento'
import { construirFormData } from '@/lib/audio-utils'

export default function Grabar() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [accion, setAccion] = useState<any>(null)
  const [nombresExistentes, setNombresExistentes] = useState<string[]>([])
  const [saldoActual, setSaldoActual] = useState<number | null>(null)
  const [interpretando, setInterpretando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  const handleAudioListo = async (blob: Blob, extension: string) => {
    setAudioUrl(URL.createObjectURL(blob))
    setError(''); setCargando(true); setTexto(''); setAccion(null); setMensajeExito('')
    try {
      const formData = construirFormData(blob, extension)
      const res = await fetch('/api/transcribir', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'No se pudo transcribir. Podés escribir el texto manualmente.')
      else setTexto(data.texto)
    } catch (err) {
      console.error(err)
      setError('Error de red. Podés escribir el texto manualmente.')
    } finally {
      setCargando(false)
    }
  }

  const interpretarTexto = async () => {
    setInterpretando(true); setAccion(null); setError('')
    try {
      const res = await fetch('/api/interpretar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccion(data.accion)
        setNombresExistentes(data.nombresExistentes ?? [])
        if (data.accion.intencion === 'PAGAR_DEUDA' && data.accion.nombre) {
          const resSaldo = await fetch(`/api/saldo?nombre=${encodeURIComponent(data.accion.nombre)}`)
          const dataSaldo = await resSaldo.json()
          setSaldoActual(dataSaldo.existe ? dataSaldo.saldo : 0)
        } else {
          setSaldoActual(null)
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error(err)
      setError('Error de red al interpretar')
    } finally {
      setInterpretando(false)
    }
  }

  const guardarMovimiento = async (accionFinal: any, confirmarSobrepago: boolean) => {
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: accionFinal.nombre, intencion: accionFinal.intencion,
          monto: accionFinal.monto, detalle: accionFinal.detalle, confirmarSobrepago,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setMensajeExito('Movimiento guardado')
        setAccion(null); setTexto(''); setSaldoActual(null); setAudioUrl(null)
      }
    } catch (err) {
      console.error(err)
      setError('Error de red al guardar')
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-ink-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Volver
      </Link>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '12px 0 24px' }}>Registrar movimiento</h1>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
        <GrabadorAudio onAudioListo={handleAudioListo} />
      </div>

      {audioUrl && <audio controls src={audioUrl} style={{ width: '100%', marginBottom: 16 }} />}
      {cargando && <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Transcribiendo…</p>}
      {error && <div className="chip chip-rojo" style={{ display: 'block', marginBottom: 12 }}>{error}</div>}

      {(texto || audioUrl) && !cargando && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Texto (editable)</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, fontFamily: 'var(--font-sans)', fontSize: 14, resize: 'vertical' }}
            placeholder="Acá aparece la transcripción, o escribí manualmente"
          />
          <button onClick={interpretarTexto} disabled={!texto || interpretando} className="btn-primario" style={{ marginTop: 12, width: '100%' }}>
            {interpretando ? 'Interpretando…' : 'Interpretar'}
          </button>
        </div>
      )}

      {accion && (
        <ConfirmacionMovimiento
          accion={accion} nombresExistentes={nombresExistentes} saldoActual={saldoActual}
          onConfirmar={guardarMovimiento}
          onCancelar={() => { setAccion(null); setSaldoActual(null) }}
        />
      )}

      {mensajeExito && (
        <div className="chip chip-verde" style={{ display: 'inline-flex', marginTop: 16 }}>
          <Check size={14} /> {mensajeExito}
        </div>
      )}
    </main>
  )
}