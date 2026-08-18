'use client'

import { useEffect } from 'react'

export default function PwaProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.error('Error registrando el service worker:', err)
        })
      })
    }
  }, [])

  return null
}