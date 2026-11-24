import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useActive } from '../lib/workout'
import { fmtDuration } from '../lib/calc'
import Icon from './Icon'

const NAV = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/rutinas', label: 'Rutinas', icon: 'list' },
  { to: '/historial', label: 'Historial', icon: 'clock' },
  { to: '/ejercicios', label: 'Ejercicios', icon: 'chart' },
]

function ActiveBar({ active }) {
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t) }, [])
  return (
    <Link to="/entrenar" className="activebar">
      <span className="activebar__pulse" aria-hidden="true" />
      <span className="activebar__txt">
        <strong>{active.name}</strong>
        <span>En curso · {fmtDuration((Date.now() - active.startedAt) / 1000)}</span>
      </span>
      <span className="activebar__go">Volver <Icon name="arrow" size={16} /></span>
    </Link>
  )
}

export default function Layout({ children }) {
  const active = useActive()
  const { pathname } = useLocation()
  const inWorkout = pathname.startsWith('/entrenar')

  if (inWorkout) return <main className="main main--focus">{children}</main>

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand"><img src="/favicon.svg" alt="" width="34" height="34" /><span>Carga</span></Link>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav__link"><Icon name={n.icon} /><span>{n.label}</span></NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        {children}
      </main>
      <div className="bottom">
        {active && <ActiveBar active={active} />}
        <nav className="tabbar" aria-label="Navegación principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="tabbar__link"><Icon name={n.icon} size={22} /><span>{n.label}</span></NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
