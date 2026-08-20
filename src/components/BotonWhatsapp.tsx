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
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: '#25D366',
      }}
    >
      <svg viewBox="0 0 24 24" width={17} height={17} fill="#fff" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.4 5.07L2 22l5.2-1.5a9.9 9.9 0 0 0 4.84 1.24h.01c5.46 0 9.9-4.45 9.9-9.91C22 6.45 17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.83-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.83-4.19-4.98-4.39-.15-.2-1.2-1.59-1.2-3.04 0-1.44.76-2.15 1.03-2.44.27-.29.6-.36.8-.36h.57c.18 0 .43-.07.67.51.24.6.83 2.06.9 2.21.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.57.36.08.13.08.75-.16 1.43Z" />
      </svg>
    </a>
  )
}