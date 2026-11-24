import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useWorkouts } from '../lib/useData'
import { workoutVolume } from '../lib/workout'
import { MONTHS, toISODate, today, weekStart, shortDate, fmtVolume, fmtKg, num } from '../lib/calc'
import Modal from '../components/Modal'
import Icon from '../components/Icon'

// Mismas medidas que guarda Tráguese ese sapo (tabla "measurements")
const FIELDS = [
  ['weight', 'Peso', 'kg'],
  ['body_fat', 'Grasa corporal', '%'],
  ['muscle', 'Masa muscular', '%'],
  ['bmi', 'IMC', ''],
  ['visceral_fat', 'Grasa visceral', ''],
  ['water', 'Agua corporal', '%'],
  ['waist', 'Cintura', 'cm'],
  ['hip', 'Cadera', 'cm'],
  ['chest', 'Pecho', 'cm'],
  ['arm', 'Brazo', 'cm'],
  ['thigh', 'Muslo', 'cm'],
]
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const r1 = (n) => Math.round(n * 10) / 10

// ---------------- Calendario de días entrenados ----------------
function TrainingCalendar({ workouts }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })

  const byDay = useMemo(() => {
    const m = {}
    for (const w of workouts) (m[toISODate(w.started_at)] ||= []).push(w)
    return m
  }, [workouts])

  const cells = useMemo(() => {
    const first = new Date(cursor)
    const offset = (first.getDay() + 6) % 7
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))]
  }, [cursor])

  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
  const monthWorkouts = workouts.filter((w) => toISODate(w.started_at).startsWith(monthKey))
  const trainedDays = new Set(monthWorkouts.map((w) => toISODate(w.started_at))).size
  const isCurrent = monthKey === today().slice(0, 7)
  const move = (d) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + d, 1))

  return (
    <section className="card">
      <div className="calhead">
        <button className="icon-btn icon-btn--sm" onClick={() => move(-1)} aria-label="Mes anterior"><Icon name="back" size={18} /></button>
        <h2 className="cap">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</h2>
        <button className="icon-btn icon-btn--sm" onClick={() => move(1)} disabled={isCurrent} aria-label="Mes siguiente"><Icon name="next" size={18} /></button>
      </div>
      <div className="cal" role="grid" aria-label="Días entrenados">
        {WEEK.map((l, i) => <span key={i} className="cal__wd">{l}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const iso = toISODate(d)
          const ws = byDay[iso]
          const cls = `cal__d ${ws ? 'is-on' : ''} ${iso === today() ? 'is-today' : ''} ${iso > today() ? 'is-future' : ''}`
          return ws
            ? <Link key={i} to={`/historial/${ws[0].id}`} className={cls} title={ws.map((w) => w.day_name).join(', ')} aria-label={`${d.getDate()}: ${ws.map((w) => w.day_name).join(', ')}`}>{d.getDate()}{ws.length > 1 && <i>{ws.length}</i>}</Link>
            : <span key={i} className={cls}>{d.getDate()}</span>
        })}
      </div>
      <p className="muted small center">
        {trainedDays ? <><strong className="accent">{trainedDays}</strong> {trainedDays === 1 ? 'día entrenado' : 'días entrenados'} · {fmtVolume(monthWorkouts.reduce((a, w) => a + workoutVolume(w.log), 0))} de volumen</> : 'Sin entrenamientos este mes'}
      </p>
    </section>
  )
}

// ---------------- Medidas ----------------
function MeasureChart({ rows, field, goal }) {
  const data = rows.filter((r) => r[field[0]] != null).slice().reverse().map((r) => ({ date: r.date, v: Number(r[field[0]]) }))
  if (data.length < 2) return <p className="muted small chart-empty">Con dos o más registros de {field[1].toLowerCase()} aquí verás la gráfica.</p>
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={48} allowDecimals={false}
            domain={[(lo) => Math.floor(Math.min(lo, goal ?? lo) - 1), (hi) => Math.ceil(Math.max(hi, goal ?? hi) + 1)]} />
          {goal != null && <ReferenceLine y={goal} stroke="var(--muted)" strokeDasharray="4 4" label={{ value: 'Meta', fill: 'var(--muted)', fontSize: 11, position: 'insideTopRight' }} />}
          <Tooltip cursor={{ stroke: 'var(--line)' }} content={({ active, payload }) => active && payload?.length ? (
            <div className="ctip"><span className="muted small">{shortDate(payload[0].payload.date)}</span><strong>{fmtKg(payload[0].value)} {field[2]}</strong></div>
          ) : null} />
          <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Measurements({ userId }) {
  const [rows, setRows] = useState(undefined)
  const [goals, setGoals] = useState({})
  const [field, setField] = useState(FIELDS[0])
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [form, setForm] = useState({ date: today() })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const load = async () => {
    const { data, error } = await supabase.from('measurements').select('*').order('date', { ascending: false }).limit(200)
    if (error) setErr(error.message)
    setRows(data || [])
  }
  useEffect(() => {
    load()
    supabase.from('profiles').select('goal_weight,goal_body_fat').eq('id', userId).maybeSingle().then(({ data }) => setGoals(data || {}))
  }, [userId])

  // Último valor de cada medida y cambio contra el registro anterior que la tenga
  const latest = useMemo(() => {
    const out = {}
    for (const [k] of FIELDS) {
      const withVal = (rows || []).filter((r) => r[k] != null)
      if (withVal[0]) out[k] = { v: Number(withVal[0][k]), date: withVal[0].date, delta: withVal[1] ? Number(withVal[0][k]) - Number(withVal[1][k]) : null }
    }
    return out
  }, [rows])

  const available = FIELDS.filter(([k]) => latest[k])
  const current = latest[field[0]] ? field : available[0] || FIELDS[0]
  const goalFor = (k) => (k === 'weight' ? goals.goal_weight : k === 'body_fat' ? goals.goal_body_fat : null)

  const save = async (e) => {
    e.preventDefault()
    const row = { user_id: userId, date: form.date }
    FIELDS.forEach(([k]) => { if (String(form[k] ?? '').trim() !== '') row[k] = num(form[k]) })
    if (form.notes) row.notes = form.notes
    if (Object.keys(row).length <= 2) return setErr('Escribe al menos una medida.')
    setBusy(true)
    setErr(null)
    const { error } = await supabase.from('measurements').insert(row)
    setBusy(false)
    if (error) return setErr(error.message)
    setOpen(false)
    setForm({ date: today() })
    load()
  }

  const remove = async (id) => {
    if (!confirm('¿Borrar este registro de medidas?')) return
    await supabase.from('measurements').delete().eq('id', id)
    load()
  }

  return (
    <section>
      <div className="sechead">
        <h2>Mis medidas</h2>
        <button className="btn btn--primary btn--sm" onClick={() => { setErr(null); setOpen(true) }}><Icon name="plus" size={16} /> Registrar</button>
      </div>

      {rows === undefined ? <div className="card"><span className="spinner" /></div> : rows.length === 0 ? (
        <div className="card empty-state">
          <Icon name="ruler" size={32} />
          <h2>Sin medidas todavía</h2>
          <p className="muted">Anota tu peso, grasa corporal y medidas (por ejemplo, las que te da tu nutriólogo) para ver cómo cambian.</p>
        </div>
      ) : (
        <div className="mstack">
          <div className="mgrid">
            {available.map(([k, l, u]) => {
              const x = latest[k]
              const g = goalFor(k)
              return (
                <button key={k} className={`mtile ${current[0] === k ? 'is-on' : ''}`} onClick={() => setField([k, l, u])} aria-pressed={current[0] === k}>
                  <span className="mtile__l">{l}</span>
                  <strong>{fmtKg(x.v)}<small>{u ? ` ${u}` : ''}</small></strong>
                  <span className="mtile__d">
                    {x.delta != null && x.delta !== 0 ? `${x.delta > 0 ? '▲' : '▼'} ${fmtKg(Math.abs(r1(x.delta)))}` : shortDate(x.date)}
                    {g != null && ` · meta ${fmtKg(Number(g))}`}
                  </span>
                </button>
              )
            })}
          </div>

          <section className="card">
            <h2 className="card__title">{current[1]}</h2>
            <MeasureChart rows={rows} field={current} goal={goalFor(current[0]) != null ? Number(goalFor(current[0])) : null} />
          </section>

          <section className="card">
            <div className="row row--between">
              <h2 className="card__title">Registros</h2>
              <span className="muted small">{rows.length}</span>
            </div>
            <ul className="mlist">
              {(showAll ? rows : rows.slice(0, 5)).map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>{shortDate(r.date)} {new Date(r.date + 'T12:00').getFullYear() !== new Date().getFullYear() ? new Date(r.date + 'T12:00').getFullYear() : ''}</strong>
                    <span className="muted small">{FIELDS.filter(([k]) => r[k] != null).map(([k, l, u]) => `${l} ${fmtKg(Number(r[k]))}${u ? ` ${u}` : ''}`).join(' · ')}</span>
                    {r.notes && <span className="small dnote">{r.notes}</span>}
                  </div>
                  <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => remove(r.id)} aria-label="Borrar registro"><Icon name="trash" size={16} /></button>
                </li>
              ))}
            </ul>
            {rows.length > 5 && <button className="linkbtn" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Ver menos' : `Ver los ${rows.length}`}</button>}
          </section>
        </div>
      )}
      {err && !open && <p className="notice notice--err">{err}</p>}

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar medidas">
        <form className="mform" onSubmit={save}>
          <label className="field mform__full"><span>Fecha</span><input type="date" required max={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          {FIELDS.map(([k, l, u]) => (
            <label key={k} className="field">
              <span>{l}{u && ` (${u})`}</span>
              <input inputMode="decimal" value={form[k] ?? ''} placeholder={latest[k] ? String(latest[k].v) : ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </label>
          ))}
          <label className="field mform__full"><span>Notas</span><input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ej. con la nutrióloga, en ayunas" maxLength={200} /></label>
          <p className="muted small mform__full">Llena solo las que tengas. En gris ves tu último valor.</p>
          {err && <p className="notice notice--err mform__full">{err}</p>}
          <button className="btn btn--primary btn--block mform__full" disabled={busy}>{busy ? 'Guardando…' : 'Guardar medidas'}</button>
        </form>
      </Modal>
    </section>
  )
}

// ---------------- Página ----------------
export default function Profile() {
  const { user, name } = useAuth()
  const { workouts } = useWorkouts(1000)

  const stats = useMemo(() => {
    const list = workouts || []
    // Racha: semanas seguidas (hasta esta) con al menos un entrenamiento
    const weeks = new Set(list.map((w) => toISODate(weekStart(new Date(w.started_at)))))
    let streak = 0
    const cur = weekStart()
    if (!weeks.has(toISODate(cur))) cur.setDate(cur.getDate() - 7) // la semana actual aún puede llenarse
    while (weeks.has(toISODate(cur))) { streak++; cur.setDate(cur.getDate() - 7) }
    return {
      total: list.length,
      streak,
      hours: list.reduce((a, w) => a + (w.duration_sec || 0), 0) / 3600,
      volume: list.reduce((a, w) => a + workoutVolume(w.log), 0),
    }
  }, [workouts])

  return (
    <div className="page">
      <header className="phead">
        <span className="avatar" aria-hidden="true">{(name || '?')[0].toUpperCase()}</span>
        <div className="phead__txt">
          <h1 className="display display--sm">{name || 'Mi perfil'}</h1>
          <span className="muted small">{user?.email}</span>
        </div>
        <button className="icon-btn" onClick={() => confirm('¿Cerrar sesión?') && supabase.auth.signOut()} aria-label="Cerrar sesión"><Icon name="logout" /></button>
      </header>

      <div className="prs">
        <div className="pr"><Icon name="dumbbell" size={18} /><strong>{stats.total}</strong><span>Entrenamientos</span></div>
        <div className="pr"><Icon name="flame" size={18} /><strong>{stats.streak}</strong><span>{stats.streak === 1 ? 'Semana seguida' : 'Semanas seguidas'}</span></div>
        <div className="pr"><Icon name="clock" size={18} /><strong>{Math.round(stats.hours)} h</strong><span>Tiempo total</span></div>
        <div className="pr"><Icon name="chart" size={18} /><strong>{fmtVolume(stats.volume)}</strong><span>Volumen total</span></div>
      </div>

      {workouts === undefined ? <div className="card"><span className="spinner" /></div> : <TrainingCalendar workouts={workouts} />}

      <Measurements userId={user.id} />
    </div>
  )
}
