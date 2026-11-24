import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useWorkouts } from '../lib/useData'
import { buildIndex } from '../lib/workout'
import { EX_BY_ID, GROUP_LABEL } from '../lib/exercises'
import { fmtKg, fmtVolume, shortDate, longDate, num } from '../lib/calc'
import { Animated } from '../components/ExerciseMedia'
import Icon from '../components/Icon'

const METRICS = [
  { k: 'best1rm', l: '1RM estimado', unit: 'kg' },
  { k: 'maxKg', l: 'Peso máximo', unit: 'kg' },
  { k: 'volume', l: 'Volumen', unit: 'kg' },
  { k: 'maxReps', l: 'Reps máximas', unit: 'reps' },
]

function ChartTip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="ctip">
      <span className="muted small">{shortDate(p.date)}</span>
      <strong>{fmtKg(payload[0].value)} {unit}</strong>
    </div>
  )
}

export default function ExerciseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const ex = EX_BY_ID[id]
  const { workouts } = useWorkouts(500)
  const s = useMemo(() => buildIndex(workouts || [])[id], [workouts, id])
  const [metric, setMetric] = useState(METRICS[0])
  const [showTech, setShowTech] = useState(false)

  const data = useMemo(() => (s?.sessions || []).slice().reverse().map((x) => ({ ...x, v: Math.round(x[metric.k] * 10) / 10 })), [s, metric])

  if (!ex) return <div className="page"><p className="empty">Ejercicio no encontrado.</p></div>

  return (
    <div className="page">
      <header className="pagehead">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Volver"><Icon name="back" /></button>
        <h1 className="h-page">{ex.nombre}</h1>
        <span />
      </header>

      <section className="card exhero">
        <Animated id={id} playing className="exhero__media" />
        <div>
          <p className="chips"><span className="chip">{GROUP_LABEL[ex.grupo]}</span><span className="chip chip--soft">{ex.equipo}</span></p>
          <button className="linkbtn" onClick={() => setShowTech((v) => !v)}>{showTech ? 'Ocultar técnica' : 'Ver técnica'}</button>
          {showTech && <ol className="steps">{ex.pasos.map((p) => <li key={p}>{p}</li>)}</ol>}
        </div>
      </section>

      {workouts === undefined ? <div className="card"><span className="spinner" /></div> : !s ? (
        <div className="card empty-state">
          <Icon name="chart" size={32} />
          <h2>Aún no lo has registrado</h2>
          <p className="muted">Cuando lo hagas en un entrenamiento verás aquí tu progreso y tus récords.</p>
        </div>
      ) : (
        <>
          <div className="prs">
            <div className="pr"><Icon name="trophy" size={18} /><strong>{s.maxKg ? `${fmtKg(s.maxKg)} kg` : '—'}</strong><span>Peso máximo</span></div>
            <div className="pr"><Icon name="spark" size={18} /><strong>{s.best1rm ? `${fmtKg(s.best1rm)} kg` : '—'}</strong><span>1RM estimado</span></div>
            <div className="pr"><Icon name="dumbbell" size={18} /><strong>{s.maxReps}</strong><span>Reps máximas</span></div>
            <div className="pr"><Icon name="chart" size={18} /><strong>{fmtVolume(s.maxVolume)}</strong><span>Mejor volumen</span></div>
          </div>

          <section className="card">
            <div className="row row--between wrap">
              <h2 className="card__title">Progreso</h2>
              <div className="chips-scroll">
                {METRICS.map((m) => (
                  <button key={m.k} className={`pill pill--soft ${metric.k === m.k ? 'is-on' : ''}`} onClick={() => setMetric(m)} aria-pressed={metric.k === m.k}>{m.l}</button>
                ))}
              </div>
            </div>
            {data.length < 2 ? (
              <p className="muted small chart-empty">Con dos o más sesiones aquí verás la gráfica.</p>
            ) : (
              <div className="chart">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={48} />
                    <Tooltip content={<ChartTip unit={metric.unit} />} cursor={{ stroke: 'var(--line)' }} />
                    <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section>
            <div className="sechead"><h2>Sesiones</h2><span className="muted small">{s.sessions.length}</span></div>
            <ul className="hlist">
              {s.sessions.map((x) => (
                <li key={x.workoutId}>
                  <Link to={`/historial/${x.workoutId}`} className="card sess">
                    <div className="row row--between">
                      <strong>{longDate(x.date)}</strong>
                      <span className="muted small">{x.best1rm ? `1RM ${fmtKg(x.best1rm)} kg` : ''}</span>
                    </div>
                    <p className="sess__sets">
                      {x.sets.map((st, i) => <span key={i}>{num(st.kg) ? fmtKg(num(st.kg)) : 'PC'}×{st.reps}{st.rpe ? <sup>@{st.rpe}</sup> : null}</span>)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
