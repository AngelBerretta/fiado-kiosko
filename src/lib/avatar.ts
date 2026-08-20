const PALETA = ['#1F3A93', '#0F6B4C', '#B3401F', '#7C3AED', '#C2410C', '#0E7490']

export function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  const primera = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primera + ultima).toUpperCase()
}

export function colorParaNombre(nombre: string): string {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return PALETA[Math.abs(hash) % PALETA.length]
}