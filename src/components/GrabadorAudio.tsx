'use client'

import { useState, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import { getSupportedMimeType } from '@/lib/audio-utils'

type Estado = 'inactivo' | 'grabando' | 'listo' | 'error'

interface Props { onAudioListo: (audioBlob: Blob, extension: string) => void }

export default function GrabadorAudio({ onAudioListo }: Props) {
  const [estado, setEstado] = useState<Estado>('inactivo')
  const [errorMsg, setErrorMsg] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const iniciarGrabacion = async () => {
    setErrorMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const tipo = getSupportedMimeType()
      if (!tipo) {
        setErrorMsg('Este navegador no soporta grabación de audio compatible.')
        setEstado('error')
        return
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType: tipo.mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: tipo.mimeType })
        onAudioListo(blob, tipo.extension)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        setEstado('listo')
      }
      mediaRecorder.start()
      setEstado('grabando')
    } catch (err) {
      console.error(err)
      setErrorMsg('No se pudo acceder al micrófono. Revisá los permisos del navegador.')
      setEstado('error')
    }
  }

  const detenerGrabacion = () => mediaRecorderRef.current?.stop()
  const grabando = estado === 'grabando'

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={grabando ? detenerGrabacion : iniciarGrabacion}
        aria-label={grabando ? 'Detener grabación' : 'Grabar'}
        style={{
          width: 84, height: 84, borderRadius: '50%', border: 'none',
          background: grabando ? 'var(--color-rojo)' : 'var(--color-accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: grabando ? '0 0 0 8px var(--color-rojo-soft)' : '0 0 0 8px var(--color-accent-soft)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {grabando ? <Square size={28} fill="#fff" /> : <Mic size={30} />}
      </button>
      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-ink-muted)' }}>
        {grabando ? 'Grabando… tocá para detener' : estado === 'listo' ? 'Tocá para grabar de nuevo' : 'Tocá para grabar'}
      </p>
      {estado === 'error' && <p style={{ color: 'var(--color-rojo)', fontSize: 13 }}>{errorMsg}</p>}
    </div>
  )
}