'use client'

import { useState } from 'react'
import GrabadorAudio from '@/components/GrabadorAudio'
import { construirFormData } from '@/lib/audio-utils'

export default function TestGrabacion() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleAudioListo = async (blob: Blob, extension: string) => {
    setAudioUrl(URL.createObjectURL(blob))
    setError('')
    setCargando(true)
    setTexto('')

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

  return (
    <main style={{ padding: 24 }}>
      <h1>Test de grabación + transcripción</h1>
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
    </main>
  )
}