'use client'

const CLAVE_SLUG = 'fiado_kiosco_slug'

export function obtenerSlugGuardado(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CLAVE_SLUG)
}

export function guardarSlug(slug: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CLAVE_SLUG, slug)
}

export function borrarSlug() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CLAVE_SLUG)
}