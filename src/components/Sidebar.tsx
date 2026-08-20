'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PieChart, Mic } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <p className="sidebar__marca">Fiado</p>
      </Link>

      <Link href="/grabar" className="sidebar__cta">
        <Mic size={16} /> Registrar por voz
      </Link>

      <nav className="sidebar__nav">
        <Link href="/" className={`sidebar__link ${pathname === '/' ? 'sidebar__link--activo' : ''}`}>
          <Home size={18} /> Inicio
        </Link>
        <Link href="/reportes" className={`sidebar__link ${pathname === '/reportes' ? 'sidebar__link--activo' : ''}`}>
          <PieChart size={18} /> Reportes
        </Link>
      </nav>
    </aside>
  )
}