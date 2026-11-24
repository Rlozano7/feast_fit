// Fechas, formatos y cálculos de fuerza

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function toISODate(d) {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const today = () => toISODate(new Date())
export const monthKey = (d = new Date()) => toISODate(d).slice(0, 7)

export function shortDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

export function longDate(iso) {
  const d = new Date(iso)
  const t = toISODate(d)
  const y = new Date(); y.setDate(y.getDate() - 1)
  if (t === today()) return 'Hoy'
  if (t === toISODate(y)) return 'Ayer'
  return `${DAYS[d.getDay()][0].toUpperCase()}${DAYS[d.getDay()].slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

export function fmtMinutes(sec) {
  const m = Math.round(sec / 60)
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`
}

export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export const fmtKg = (n) => (Math.round(n * 10) / 10).toLocaleString('es-MX')

export function fmtVolume(kg) {
  return kg >= 10000 ? `${(kg / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} t` : `${fmtKg(kg)} kg`
}

// 1RM estimado (fórmula de Epley). Solo tiene sentido con peso y hasta ~15 reps.
export function e1rm(kg, reps) {
  kg = num(kg); reps = num(reps)
  if (kg <= 0 || reps <= 0) return 0
  if (reps === 1) return kg
  return kg * (1 + Math.min(reps, 15) / 30)
}

export function weekStart(d = new Date()) {
  const x = new Date(d)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  x.setHours(0, 0, 0, 0)
  return x
}
