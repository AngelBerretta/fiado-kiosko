'use client'

import { useState, useRef } from 'react'
import { getSupportedMimeType } from '@/lib/audio-utils'

type Estado = 'inactivo' | 'grabando' | 'listo' | 'error'

interface Props {
  onAudioListo: (audioBlob: Blob, extension: string) => void
}

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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

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

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop()
  }

  return (
    <div>
      {estado === 'inactivo' && <button onClick={iniciarGrabacion}>🎙️ Grabar</button>}
      {estado === 'grabando' && <button onClick={detenerGrabacion}>⏹️ Detener</button>}
      {estado === 'listo' && <button onClick={iniciarGrabacion}>🎙️ Grabar de nuevo</button>}
      {estado === 'error' && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  )
}