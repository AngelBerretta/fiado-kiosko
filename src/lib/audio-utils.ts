const TIPOS_SOPORTADOS = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' }, // Chrome/Android
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/mp4', extension: 'mp4' },                // Safari/iPhone
  { mimeType: 'audio/aac', extension: 'aac' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
]

export function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  for (const tipo of TIPOS_SOPORTADOS) {
    if (MediaRecorder.isTypeSupported(tipo.mimeType)) {
      return tipo
    }
  }
  return null
}

export function construirFormData(audioBlob: Blob, extension: string) {
  const formData = new FormData()
  formData.append('audio', audioBlob, `grabacion.${extension}`)
  return formData
}