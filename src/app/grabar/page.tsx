'use client'

import { useState } from 'react'
import GrabadorAudio from '@/components/GrabadorAudio'
import ConfirmacionMovimiento from '@/components/ConfirmacionMovimiento'
import { construirFormData } from '@/lib/audio-utils'

export default function TestGrabacion() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [accion, setAccion] = useState<any>(null)
  const [interpretando, setInterpretando] = useState(false)
  const [nombresExistentes, setNombresExistentes] = useState<string[]>([])

  const handleAudioListo = async (blob: Blob, extension: string) => {
    setAudioUrl(URL.createObjectURL(blob))
    setError('')
    setCargando(true)
    setTexto('')
    setAccion(null)

    try {
      const formData = construirFormData(blob, extension)
      const res = await fetch('/api/transcribir', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'No se pudo transcribir. Podés escribir el texto manualmente.')
      } else {
        setTexto(data.texto)
      }
    } catch (err) {
      console.error(err)
      setError('Error de red. Podés escribir el texto manualmente.')
    } finally {
      setCargando(false)
    }
  }

  const interpretarTexto = async () => {
    setInterpretando(true)
    setAccion(null)
    setError('')
    try {
      const res = await fetch('/api/interpretar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccion(data.accion)
        setNombresExistentes(data.nombresExistentes ?? [])
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

  return (
    <main style={{ padding: 24 }}>
      <h1>Test de grabación + transcripción + interpretación</h1>
      <GrabadorAudio onAudioListo={handleAudioListo} />

      {audioUrl && <audio controls src={audioUrl} style={{ marginTop: 16 }} />}

      {cargando && <p>Transcribiendo...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <label>Texto (editable):</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          style={{ width: '100%', display: 'block', marginTop: 4 }}
          placeholder="Acá aparece la transcripción, o escribí manualmente si falló"
        />
      </div>

      <button 
        onClick={interpretarTexto} 
        disabled={!texto || interpretando}
        style={{ marginTop: 12, padding: '8px 16px' }}
      >
        {interpretando ? 'Interpretando...' : '🧠 Interpretar'}
      </button>

      {accion && (
        <ConfirmacionMovimiento
          accion={accion}
          nombresExistentes={nombresExistentes}
          onConfirmar={(accionFinal) => {
            console.log('Confirmado:', accionFinal)
            // acá va a ir el guardado real en el Día 7
          }}
          onCancelar={() => setAccion(null)}
        />
      )}
    </main>
  )
}