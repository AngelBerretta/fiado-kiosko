import { obtenerIniciales, colorParaNombre } from '@/lib/avatar'

export default function AvatarIniciales({ nombre }: { nombre: string }) {
  return (
    <div className="avatar-iniciales" style={{ background: colorParaNombre(nombre) }}>
      {obtenerIniciales(nombre)}
    </div>
  )
}