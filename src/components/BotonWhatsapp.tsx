import { MessageCircle } from 'lucide-react'

interface Props { telefono: string; nombre: string; saldo: number }

function limpiarTelefono(telefono: string) {
  return telefono.replace(/\D/g, '')
}

export default function BotonWhatsapp({ telefono, nombre, saldo }: Props) {
  const numero = limpiarTelefono(telefono)
  if (!numero) return null

  const mensaje = `Hola ${nombre}! Te escribo del kiosco para recordarte que tenés un saldo pendiente de $${saldo.toLocaleString('es-AR')}. ¡Gracias!`
  const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Recordar por WhatsApp a ${nombre}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--color-verde-soft)', color: 'var(--color-verde)',
      }}
    >
      <MessageCircle size={16} />
    </a>
  )
}