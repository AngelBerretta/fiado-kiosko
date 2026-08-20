'use client'

import { useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'

interface Props {
  segundos: number
  onTerminar: () => void
  onCancelar: () => void
}

function formatearTiempo(totalSegundos: number) {
  const m = Math.floor(totalSegundos / 60).toString().padStart(2, '0')
  const s = (totalSegundos % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function PantallaEscuchando({ segundos, onTerminar, onCancelar }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  return (
    <div className="pantalla-escuchando">
      <div className="pantalla-escuchando__texto">
        <h1 ref={tituloRef} tabIndex={-1}>Escuchando…</h1>
        <p>Decí algo como &quot;Anotale 500 pesos a Carlos por una coca&quot;</p>
      </div>

      <div className="pantalla-escuchando__mic" aria-hidden="true">
        <span className="pantalla-escuchando__pulso" />
        <span className="pantalla-escuchando__pulso" style={{ animationDelay: '1s' }} />
        <span className="pantalla-escuchando__circulo">
          <Mic size={34} />
        </span>
      </div>

      <div className="pantalla-escuchando__acciones">
        <div className="pantalla-escuchando__tiempo" aria-hidden="true">{formatearTiempo(segundos)}</div>
        <button onClick={onTerminar} className="pantalla-escuchando__btn-principal">
          Terminar y procesar
        </button>
        <button onClick={onCancelar} className="pantalla-escuchando__btn-secundario">
          Cancelar
        </button>
      </div>
    </div>
  )
}