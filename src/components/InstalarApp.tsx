'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

const CLAVE_DESCARTADO = 'fiado_pwa_descartado'

export default function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState<any>(null)
  const [mostrar, setMostrar] = useState(false)
  const [esIos, setEsIos] = useState(false)

  useEffect(() => {
    const yaDescartado = localStorage.getItem(CLAVE_DESCARTADO)
    if (yaDescartado) return

    const esStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone

    if (esStandalone) return

    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setEsIos(ios)

    if (ios) {
      setMostrar(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e)
      setMostrar(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setMostrar(false)
  }

  const descartar = () => {
    localStorage.setItem(CLAVE_DESCARTADO, '1')
    setMostrar(false)
  }

  if (!mostrar) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
        left: 16,
        right: 16,
        maxWidth: 448,
        margin: '0 auto',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(20,23,31,0.12)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Instalá Fiado en tu celular</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-ink-muted)' }}>
          {esIos
            ? 'Tocá el botón compartir de Safari y elegí "Agregar a inicio"'
            : 'Accedé más rápido, como una app'}
        </p>
      </div>
      {!esIos && (
        <button onClick={instalar} className="btn-primario" style={{ padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
          <Download size={14} /> Instalar
        </button>
      )}
      <button
        onClick={descartar}
        aria-label="Cerrar"
        style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
      >
        <X size={18} />
      </button>
    </div>
  )
}