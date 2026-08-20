'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import PantallaEscuchando from '@/components/PantallaEscuchando'
import ConfirmacionMovimiento from '@/components/ConfirmacionMovimiento'
import NumerosResaltados from '@/components/NumerosResaltados'
import { construirFormData } from '@/lib/audio-utils'
import { useGrabacionAudio } from '@/lib/useGrabacionAudio'
import { useKioscoSlug } from '@/lib/useKiosco'

export default function Grabar() {
  const router = useRouter()
  const { slug, cargando: cargandoSlug } = useKioscoSlug()
  const [texto, setTexto] = useState('')
  const [transcribiendo, setTranscribiendo] = useState(false)
  const [error, setError] = useState('')
  const [accion, setAccion] = useState<any>(null)
  const [nombresExistentes, setNombresExistentes] = useState<string[]>([])
  const [interpretando, setInterpretando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  const handleAudioListo = async (blob: Blob, extension: string) => {
    setError(''); setTranscribiendo(true); setTexto(''); setAccion(null); setMensajeExito('')
    try {
      const formData = construirFormData(blob, extension)
      const res = await fetch('/api/transcribir', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'No se pudo transcribir. Podés escribir el texto manualmente.')
      else setTexto(data.texto)
    } catch (err) {
      console.error(err)
      setError('Error de red. Podés escribir el texto manualmente.')
    } finally {
      setTranscribiendo(false)
    }
  }

  const { estado: estadoGrabacion, errorMsg: errorMic, segundos, detener, cancelar, reintentar } = useGrabacionAudio(handleAudioListo)

  useEffect(() => {
    if (estadoGrabacion === 'cancelada') router.replace('/')
  }, [estadoGrabacion, router])

  const grabarDeNuevo = () => {
    setTexto(''); setAccion(null); setError(''); setMensajeExito('')
    reintentar()
  }

  const interpretarTexto = async () => {
    if (!slug) return
    setInterpretando(true); setAccion(null); setError('')
    try {
      const res = await fetch('/api/interpretar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto, slug }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccion(data.accion)
        setNombresExistentes(data.nombresExistentes ?? [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error(err)
      setError('Error de red al interpretar')
    } finally {
      setInterpretando(false)
    }
  }

  const guardarMovimiento = async (accionFinal: any, confirmarSobrepago: boolean) => {
    if (!slug) return
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: accionFinal.nombre, intencion: accionFinal.intencion,
          monto: accionFinal.monto, detalle: accionFinal.detalle, confirmarSobrepago, slug,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setMensajeExito('Movimiento guardado')
        setAccion(null); setTexto('')
      }
    } catch (err) {
      console.error(err)
      setError('Error de red al guardar')
    }
  }

  if (cargandoSlug || !slug) {
    return (
      <main className="pagina-angosta">
        <p style={{ color: 'var(--color-ink-muted)' }}>Cargando…</p>
      </main>
    )
  }

  if (estadoGrabacion === 'iniciando' || estadoGrabacion === 'grabando') {
    return <PantallaEscuchando segundos={segundos} onTerminar={detener} onCancelar={cancelar} />
  }

  if (estadoGrabacion === 'error') {
    return (
      <main className="pagina-angosta">
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>Registrar movimiento</h1>
        <div className="chip chip-rojo" role="alert" style={{ display: 'block', marginBottom: 16 }}>{errorMic}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reintentar} className="btn-primario" style={{ flex: 1 }}>Reintentar</button>
          <button onClick={() => router.replace('/')} className="btn-secundario">Volver</button>
        </div>
      </main>
    )
  }

  return (
    <main className="pagina-angosta">
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 24px' }}>Registrar movimiento</h1>

      {transcribiendo && <p role="status" style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Transcribiendo…</p>}
      {error && <div className="chip chip-rojo" role="alert" style={{ display: 'block', marginBottom: 12 }}>{error}</div>}

      {texto && !transcribiendo && !accion && (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <NumerosResaltados texto={texto} />

            <label htmlFor="texto-transcripcion" style={{ fontSize: 12, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>
              Texto (editable)
            </label>
            <textarea
              id="texto-transcripcion"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, fontFamily: 'var(--font-sans)', fontSize: 16, resize: 'vertical' }}
              placeholder="Acá aparece la transcripción, o escribí manualmente"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={interpretarTexto} disabled={!texto || interpretando} className="btn-primario" style={{ flex: 1 }}>
                {interpretando ? 'Interpretando…' : 'Interpretar'}
              </button>
              <button onClick={grabarDeNuevo} className="btn-secundario" style={{ whiteSpace: 'nowrap', fontSize: 13, padding: '10px 14px' }}>
                Grabar de nuevo
              </button>
            </div>
          </div>
          <Link href="/" className="link-cancelar-flujo">Cancelar y volver a inicio</Link>
        </>
      )}

      {accion && slug && (
        <ConfirmacionMovimiento
          accion={accion} nombresExistentes={nombresExistentes} slug={slug}
          onConfirmar={guardarMovimiento}
          onCancelar={() => setAccion(null)}
        />
      )}

      {mensajeExito && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div className="exito-check"><Check size={22} /></div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: '12px 0 4px' }}>{mensajeExito}</p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 20px' }}>¿Qué querés hacer ahora?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={grabarDeNuevo} className="btn-primario">Registrar otro</button>
            <Link href="/" className="btn-secundario" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              Volver a inicio
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}