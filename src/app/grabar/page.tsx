'use client'

import { useState } from 'react'
import GrabadorAudio from '@/components/GrabadorAudio'

export default function TestGrabacion() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [info, setInfo] = useState('')

  const handleAudioListo = (blob: Blob, extension: string) => {
    setAudioUrl(URL.createObjectURL(blob))
    setInfo(`Tipo: ${blob.type} | Extensión: ${extension} | Tamaño: ${(blob.size / 1024).toFixed(1)} KB`)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Test de grabación</h1>
      <GrabadorAudio onAudioListo={handleAudioListo} />
      {audioUrl && (
        <div style={{ marginTop: 16 }}>
          <p>{info}</p>
          <audio controls src={audioUrl} />
        </div>
      )}
    </main>
  )
}