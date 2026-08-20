'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PieChart, Mic } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav__item ${pathname === '/' ? 'bottom-nav__item--activo' : ''}`}>
        <Home size={19} />
        <span>Inicio</span>
      </Link>

      <Link href="/grabar" aria-label="Registrar por voz" className="bottom-nav__fab">
        <Mic size={22} />
      </Link>

      <Link href="/reportes" className={`bottom-nav__item ${pathname === '/reportes' ? 'bottom-nav__item--activo' : ''}`}>
        <PieChart size={19} />
        <span>Reportes</span>
      </Link>
    </nav>
  )
}