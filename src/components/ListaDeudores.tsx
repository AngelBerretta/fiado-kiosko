'use client'

import { useRef, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { DeudorConSaldo } from '@/lib/saldos'
import BotonWhatsapp from './BotonWhatsapp'
import AvatarIniciales from './AvatarIniciales'
import AgregarClienteManual from './AgregarClienteManual'

interface Props {
  deudores: DeudorConSaldo[]
  orden?: 'saldo' | 'antiguedad'
  slug: string
  onClienteAgregado: () => void
}

function horasSinPagar(fecha: string | null): number {
  if (!fecha) return Infinity
  return (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60)
}

function etiquetaTiempo(horas: number) {
  if (horas === Infinity) return ''
  if (horas < 1) return 'recién'
  if (horas < 24) return `hace ${Math.floor(horas)}h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'ayer' : `hace ${dias}d`
}

export default function ListaDeudores({ deudores, orden = 'saldo', slug, onClienteAgregado }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)

  const conDeuda = deudores.filter((d) => d.saldo > 0)
  const filtrados = conDeuda.filter((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  const ordenados = [...filtrados].sort((a, b) =>
    orden === 'saldo' ? b.saldo - a.saldo : horasSinPagar(b.ultimoMovimiento) - horasSinPagar(a.ultimoMovimiento)
  )

  const cerrarFormulario = () => {
    setMostrandoFormulario(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const clienteCreado = () => {
    cerrarFormulario()
    setMensajeExito('Cliente agregado')
    onClienteAgregado()
    setTimeout(() => setMensajeExito(''), 3000)
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Clientes fiados</h2>
        <div className="buscador">
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {!mostrandoFormulario && (
          <button
            ref={triggerRef}
            onClick={() => setMostrandoFormulario(true)}
            className="trigger-agregar-cliente"
            aria-expanded={mostrandoFormulario}
            aria-controls="form-agregar-cliente"
          >
            <UserPlus size={14} /> Agregar cliente a mano
          </button>
        )}

        {mensajeExito && (
          <p role="status" style={{ fontSize: 12, color: 'var(--color-verde)', margin: '6px 0 0' }}>{mensajeExito}</p>
        )}

        {mostrandoFormulario && (
          <div id="form-agregar-cliente">
            <AgregarClienteManual slug={slug} onClienteCreado={clienteCreado} onCancelar={cerrarFormulario} />
          </div>
        )}
      </div>

      {ordenados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-ink-muted)', fontSize: 14 }}>
          {busqueda ? 'Sin resultados' : 'No hay deudores con saldo pendiente'}
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {ordenados.map((d, i) => (
            <div
              key={d.id}
              className="fila-deudor"
              style={{ borderBottom: i < ordenados.length - 1 ? '1px dashed var(--color-border)' : 'none' }}
            >
              <AvatarIniciales nombre={d.nombre} />
              <div className="fila-deudor__info">
                <p className="fila-deudor__nombre">{d.nombre}</p>
              </div>
              <div className="fila-deudor__monto-wrap">
                <span className="monto" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-rojo)' }}>
                  ${d.saldo.toLocaleString('es-AR')}
                </span>
                <p className="fila-deudor__tiempo">{etiquetaTiempo(horasSinPagar(d.ultimoMovimiento))}</p>
              </div>
              {d.telefono && <BotonWhatsapp telefono={d.telefono} nombre={d.nombre} saldo={d.saldo} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}