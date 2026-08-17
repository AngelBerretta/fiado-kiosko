interface Props {
  telefono: string
  nombre: string
  saldo: number
}

function limpiarTelefono(telefono: string) {
  return telefono.replace(/\D/g, '')
}

export default function BotonWhatsapp({ telefono, nombre, saldo }: Props) {
  const numero = limpiarTelefono(telefono)

  if (!numero) return <span style={{ fontSize: 12, color: '#999' }}>sin teléfono</span>

  const mensaje = `Hola ${nombre}! Te escribo del kiosco para recordarte que tenés un saldo pendiente de $${saldo.toLocaleString('es-AR')}. ¡Gracias!`
  const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
      📲 Recordar
    </a>
  )
}