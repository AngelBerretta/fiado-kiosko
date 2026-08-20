const TIPOS_SOPORTADOS = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/mp4', extension: 'mp4' },
  { mimeType: 'audio/aac', extension: 'aac' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
]

export function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  for (const tipo of TIPOS_SOPORTADOS) {
    if (MediaRecorder.isTypeSupported(tipo.mimeType)) return tipo
  }
  return null
}

export function construirFormData(audioBlob: Blob, extension: string) {
  const formData = new FormData()
  formData.append('audio', audioBlob, `grabacion.${extension}`)
  return formData
}

export function vibrarSiSoportado(duracionMs: number) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(duracionMs)
  } catch {
    // Algunos navegadores tiran error sin un gesto de usuario reciente; no es crítico.
  }
}