'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { getSupportedMimeType, vibrarSiSoportado } from './audio-utils'

export type EstadoGrabacion = 'iniciando' | 'grabando' | 'detenida' | 'cancelada' | 'error'

export function useGrabacionAudio(onAudioListo: (blob: Blob, extension: string) => void) {
  const [estado, setEstado] = useState<EstadoGrabacion>('iniciando')
  const [errorMsg, setErrorMsg] = useState('')
  const [segundos, setSegundos] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const canceladaRef = useRef(false)

  const limpiar = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const iniciar = useCallback(async () => {
    setErrorMsg('')
    canceladaRef.current = false
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
        limpiar()
        if (canceladaRef.current) { setEstado('cancelada'); return }
        vibrarSiSoportado(60)
        const blob = new Blob(chunksRef.current, { type: tipo.mimeType })
        setEstado('detenida')
        onAudioListo(blob, tipo.extension)
      }
      mediaRecorder.start()
      vibrarSiSoportado(80)
      setEstado('grabando')
      setSegundos(0)
      intervaloRef.current = setInterval(() => setSegundos((s) => s + 1), 1000)
    } catch (err) {
      console.error(err)
      setErrorMsg('No se pudo acceder al micrófono. Revisá los permisos del navegador.')
      setEstado('error')
    }
  }, [limpiar, onAudioListo])

  const detener = useCallback(() => mediaRecorderRef.current?.stop(), [])
  const cancelar = useCallback(() => {
    canceladaRef.current = true
    mediaRecorderRef.current?.stop()
  }, [])

  useEffect(() => {
    iniciar()
    return () => limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { estado, errorMsg, segundos, detener, cancelar, reintentar: iniciar }
}