'use client'

import { useRef, useState } from 'react'
import { Search, UserPlus, Pencil } from 'lucide-react'
import { DeudorConSaldo } from '@/lib/saldos'
import BotonWhatsapp from './BotonWhatsapp'
import AvatarIniciales from './AvatarIniciales'
import AgregarClienteManual from './AgregarClienteManual'
import EditarClienteManual from './EditarClienteManual'

interface Props {
  deudores: DeudorConSaldo[]
  orden?: 'saldo' | 'antiguedad'
  slug: string
  onClienteAgregado: () => void
}

type Panel =
  | { tipo: 'nuevo' }
  | { tipo: 'fiado'; cliente: DeudorConSaldo }
  | { tipo: 'editar'; cliente: DeudorConSaldo }
  | null

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
  const [panel, setPanel] = useState<Panel>(null)
  const [mensajeExito, setMensajeExito] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Sin búsqueda: solo quienes deben (comportamiento original, sin cambios).
  // Buscando: mira a todos los clientes, incluidos los que están en $0.
  const hayBusqueda = busqueda.trim() !== ''
  const base = hayBusqueda ? deudores : deudores.filter((d) => d.saldo > 0)
  const filtrados = base.filter((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  const ordenados = [...filtrados].sort((a, b) =>
    orden === 'saldo' ? b.saldo - a.saldo : horasSinPagar(b.ultimoMovimiento) - horasSinPagar(a.ultimoMovimiento)
  )

  const cerrarPanel = () => {
    setPanel(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const avisarExito = (mensaje: string) => {
    cerrarPanel()
    setMensajeExito(mensaje)
    onClienteAgregado()
    setTimeout(() => setMensajeExito(''), 3500)
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

        {panel === null && (
          <button
            ref={triggerRef}
            onClick={() => setPanel({ tipo: 'nuevo' })}
            className="trigger-agregar-cliente"
            aria-expanded={false}
            aria-controls="panel-cliente"
          >
            <UserPlus size={14} /> Agregar cliente a mano
          </button>
        )}

        {mensajeExito && (
          <p role="status" style={{ fontSize: 12, color: 'var(--color-verde)', margin: '6px 0 0' }}>{mensajeExito}</p>
        )}

        {panel?.tipo === 'nuevo' && (
          <div id="panel-cliente">
            <AgregarClienteManual slug={slug} onClienteCreado={avisarExito} onCancelar={cerrarPanel} />
          </div>
        )}
        {panel?.tipo === 'fiado' && (
          <div id="panel-cliente">
            <AgregarClienteManual
              slug={slug}
              clienteExistente={{ id: panel.cliente.id, nombre: panel.cliente.nombre, telefono: panel.cliente.telefono }}
              onClienteCreado={avisarExito}
              onCancelar={cerrarPanel}
            />
          </div>
        )}
        {panel?.tipo === 'editar' && (
          <div id="panel-cliente">
            <EditarClienteManual
              cliente={panel.cliente}
              onGuardado={avisarExito}
              onEliminado={() => avisarExito('Cliente eliminado')}
              onCancelar={cerrarPanel}
            />
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
                {d.saldo === 0 && (
                  <button onClick={() => setPanel({ tipo: 'fiado', cliente: d })} className="fila-deudor__agregar-fiado">
                    + Agregar fiado
                  </button>
                )}
              </div>
              <div className="fila-deudor__monto-wrap">
                {d.saldo > 0 ? (
                  <>
                    <span className="monto" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-rojo)' }}>
                      ${d.saldo.toLocaleString('es-AR')}
                    </span>
                    <p className="fila-deudor__tiempo">{etiquetaTiempo(horasSinPagar(d.ultimoMovimiento))}</p>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Sin deuda</span>
                )}
              </div>
              <button
                onClick={() => setPanel({ tipo: 'editar', cliente: d })}
                aria-label={`Editar a ${d.nombre}`}
                className="fila-deudor__editar"
              >
                <Pencil size={14} />
              </button>
              {d.telefono && d.saldo > 0 && <BotonWhatsapp telefono={d.telefono} nombre={d.nombre} saldo={d.saldo} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}