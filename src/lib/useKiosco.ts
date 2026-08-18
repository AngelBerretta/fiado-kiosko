'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerSlugGuardado } from './kiosco-client'

export function useKioscoSlug(redirigirSiNoHay = true) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const guardado = obtenerSlugGuardado()
    if (!guardado) {
      if (redirigirSiNoHay) router.replace('/acceso')
      return
    }
    setSlug(guardado)
    setCargando(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { slug, cargando }
}