// Íconos de línea (stroke = currentColor)
const P = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  dumbbell: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  chart: 'M4 20V4M4 20h16M8 16l4-5 3 3 5-7',
  check: 'M4 12l5 5L20 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  play: 'M7 4l13 8-13 8z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  back: 'M15 6l-6 6 6 6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h11',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  note: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',
  copy: 'M8 8h11v12H8zM5 16V4h11',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  next: 'M9 6l6 6-6 6',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 2 1.5 3 2.5 3C11 9 11 6 12 3z',
  ruler: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
}

export default function Icon({ name, size = 20, stroke = 1.9, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  )
}
