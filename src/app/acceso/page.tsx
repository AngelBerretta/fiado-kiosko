'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarSlug } from '@/lib/kiosco-client'
import { Sparkles, Copy, Check } from 'lucide-react'

const SLUG_DEMO = 'demo-jurado'

export default function Acceso() {
  const router = useRouter()
  const [modo, setModo] = useState<'entrar' | 'crear' | 'creado'>('entrar')
  const [slug, setSlug] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [kioscoCreado, setKioscoCreado] = useState<{ nombre: string; slug: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  const entrarConSlug = async (slugAUsar: string) => {
    setError('')
    setCargando(true)
    try {
      const res = await fetch(`/api/kioscos?slug=${encodeURIComponent(slugAUsar.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.existe) {
        setError('No encontramos ese código de acceso')
      } else {
        guardarSlug(data.kiosco.slug_acceso)
        router.replace('/')
      }
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setCargando(false)
    }
  }

  const crear = async () => {
    setError('')
    setCargando(true)
    try {
      const res = await fetch('/api/kioscos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No se pudo crear el kiosco')
      } else {
        setKioscoCreado({ nombre: data.kiosco.nombre, slug: data.kiosco.slug_acceso })
        setModo('creado')
        setCopiado(false)
      }
    } catch (err) {
      console.error(err)
      setError('Error de red')
    } finally {
      setCargando(false)
    }
  }

  const entrarAlKioscoCreado = () => {
    if (kioscoCreado) {
      guardarSlug(kioscoCreado.slug)
      router.replace('/')
    }
  }

  const copiarCodigo = async () => {
    if (kioscoCreado) {
      try {
        await navigator.clipboard.writeText(kioscoCreado.slug)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      } catch (err) {
        console.error('Error copiando:', err)
      }
    }
  }

  // Vista cuando se creó un kiosco nuevo
  if (modo === 'creado' && kioscoCreado) {
    return (
      <main style={{ maxWidth: 420, margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Fiado</h1>
        <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 24 }}>
          ¡Tu kiosco está listo!
        </p>

        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', margin: '0 0 4px' }}>
            {kioscoCreado.nombre}
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>
            Este es tu código de acceso
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', margin: '0 0 16px' }}>
            Guardalo para entrar desde cualquier dispositivo
          </p>

          <div style={{
            background: 'var(--color-accent-soft)',
            padding: '14px 16px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            marginBottom: 20,
            wordBreak: 'break-all'
          }}>
            {kioscoCreado.slug}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copiarCodigo} className="btn-secundario" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? '¡Copiado!' : 'Copiar'}
            </button>
            <button onClick={entrarAlKioscoCreado} className="btn-primario" style={{ flex: 1 }}>
              Entrar →
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '48px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Fiado</h1>
      <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 24 }}>
        Cuenta corriente del kiosco, gestionada por voz.
      </p>

      {/* Botón demo destacado */}
      <button
        onClick={() => entrarConSlug(SLUG_DEMO)}
        disabled={cargando}
        className="btn-primario"
        style={{ width: '100%', marginBottom: 28, background: 'var(--color-verde)' }}
      >
        <Sparkles size={16} /> {cargando ? 'Entrando…' : 'Ver demo (sin crear cuenta)'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>o</span>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setModo('entrar')}
          className={modo === 'entrar' ? 'btn-primario' : 'btn-secundario'}
          style={{ flex: 1 }}
        >
          Ya tengo cuenta
        </button>
        <button
          onClick={() => setModo('crear')}
          className={modo === 'crear' ? 'btn-primario' : 'btn-secundario'}
          style={{ flex: 1 }}
        >
          Crear kiosco
        </button>
      </div>

      {modo === 'entrar' ? (
        <div className="card">
          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Código de acceso</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ej: kiosco-la-esquina-a1b2"
            style={{
              display: 'block', width: '100%', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 10, margin: '6px 0 12px', fontSize: 15,
            }}
          />
          <button onClick={() => entrarConSlug(slug)} disabled={!slug || cargando} className="btn-primario" style={{ width: '100%' }}>
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      ) : (
        <div className="card">
          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Nombre del kiosco</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej: Kiosco La Esquina"
            style={{
              display: 'block', width: '100%', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 10, margin: '6px 0 12px', fontSize: 15,
            }}
          />
          <button onClick={crear} disabled={!nombre || cargando} className="btn-primario" style={{ width: '100%' }}>
            {cargando ? 'Creando…' : 'Crear y continuar'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'var(--color-rojo)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      {/* Instrucciones para el jurado */}
      <div className="card" style={{ marginTop: 28, background: 'var(--color-accent-soft)', border: 'none' }}>
        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6, color: 'var(--color-accent)' }}>
          <strong>💡 Probá la demo:</strong> Entrá con el botón verde, andá a <em>"Registrar por voz"</em> y grabá un audio diciendo <em>"Juan Pérez debe 500 pesos"</em>. Mirá cómo se transcribe, interpreta y guarda automáticamente.
        </p>
      </div>

      {/* <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 20, textAlign: 'center' }}>
        Código demo: <code>demo-jurado</code>
      </p> */}
    </main>
  )
}