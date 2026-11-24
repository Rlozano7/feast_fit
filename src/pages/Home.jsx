import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useWorkouts, useTemplates, useCoachRoutine, useStart } from '../lib/useData'
import { useActive, workoutVolume } from '../lib/workout'
import { EX_BY_ID } from '../lib/exercises'
import { weekStart, toISODate, fmtMinutes, fmtVolume, longDate } from '../lib/calc'
import Icon from '../components/Icon'

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Home() {
  const { name } = useAuth()
  const active = useActive()
  const start = useStart()
  const nav = useNavigate()
  const { workouts } = useWorkouts(120)
  const { templates } = useTemplates()
  const coach = useCoachRoutine()

  const week = useMemo(() => {
    const ws = weekStart()
    const list = (workouts || []).filter((w) => new Date(w.started_at) >= ws)
    const days = new Set(list.map((w) => toISODate(w.started_at)))
    const strip = WEEK.map((l, i) => {
      const d = new Date(ws); d.setDate(d.getDate() + i)
      const iso = toISODate(d)
      return { l, on: days.has(iso), today: iso === toISODate(new Date()) }
    })
    return {
      count: list.length,
      time: list.reduce((a, w) => a + (w.duration_sec || 0), 0),
      volume: list.reduce((a, w) => a + workoutVolume(w.log), 0),
      strip,
    }
  }, [workouts])

  const last = workouts?.[0]

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">{longDate(new Date().toISOString())}</p>
          <h1 className="display display--sm">Hola, {name || 'atleta'}</h1>
        </div>
        <Link to="/perfil" className="avatar avatar--sm" aria-label="Mi perfil">{(name || '?')[0].toUpperCase()}</Link>
      </header>

      <motion.button className="cta" whileTap={{ scale: 0.98 }}
        onClick={() => (active ? nav('/entrenar') : start({ name: 'Entrenamiento libre', exercises: [] }))}>
        <span className="cta__icon"><Icon name={active ? 'arrow' : 'play'} size={22} stroke={2.4} /></span>
        <span>
          <strong>{active ? 'Continuar entrenamiento' : 'Empezar entrenamiento libre'}</strong>
          <span>{active ? active.name : 'Agrega ejercicios sobre la marcha'}</span>
        </span>
      </motion.button>

      <section className="card">
        <div className="row row--between">
          <h2 className="card__title">Esta semana</h2>
          <div className="weekstrip" aria-label="Días entrenados esta semana">
            {week.strip.map((d, i) => (
              <span key={i} className={`weekstrip__d ${d.on ? 'is-on' : ''} ${d.today ? 'is-today' : ''}`} title={d.on ? 'Entrenaste' : ''}>{d.l}</span>
            ))}
          </div>
        </div>
        <div className="kpis">
          <div><strong>{week.count}</strong><span>entrenamientos</span></div>
          <div><strong>{fmtMinutes(week.time)}</strong><span>tiempo</span></div>
          <div><strong>{fmtVolume(week.volume)}</strong><span>volumen</span></div>
        </div>
      </section>

      <section>
        <div className="sechead">
          <h2>Mis rutinas</h2>
          <Link to="/rutinas" className="linkbtn">Ver todas</Link>
        </div>
        {templates === undefined ? <div className="card"><span className="spinner" /></div> : templates.length === 0 ? (
          <Link to="/rutinas/nueva" className="card card--dashed">
            <Icon name="plus" /> <span>Arma tu primera rutina</span>
          </Link>
        ) : (
          <div className="tiles">
            {templates.slice(0, 4).map((t) => (
              <button key={t.id} className="tile" onClick={() => start({ name: t.name, templateId: t.id, exercises: t.exercises })}>
                <strong>{t.name}</strong>
                <span className="muted small">{t.exercises.length} ejercicios</span>
                <span className="tile__go"><Icon name="play" size={14} stroke={2.4} /></span>
              </button>
            ))}
          </div>
        )}
      </section>

      {coach?.plan?.days?.length > 0 && (
        <section>
          <div className="sechead">
            <h2>Rutina del Coach</h2>
            <span className="muted small">{coach.plan.title}</span>
          </div>
          <div className="tiles">
            {coach.plan.days.map((d, i) => (
              <button key={i} className="tile tile--coach"
                onClick={() => start({ name: `${d.name} · ${d.focus}`, routineId: coach.id, exercises: d.exercises.filter((x) => EX_BY_ID[x.id]) })}>
                <strong>{d.name}</strong>
                <span className="muted small">{d.focus}</span>
                <span className="tile__go"><Icon name="play" size={14} stroke={2.4} /></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {last && (
        <section>
          <div className="sechead">
            <h2>Último entrenamiento</h2>
            <Link to="/historial" className="linkbtn">Historial</Link>
          </div>
          <Link to={`/historial/${last.id}`} className="card wsum">
            <div className="row row--between">
              <strong>{last.day_name}</strong>
              <span className="muted small">{longDate(last.started_at)}</span>
            </div>
            <p className="muted small">{fmtMinutes(last.duration_sec)} · {fmtVolume(workoutVolume(last.log))} · {last.sets_done} series</p>
            <p className="small wsum__ex">{(last.log || []).map((x) => EX_BY_ID[x.id]?.nombre).filter(Boolean).join(' · ')}</p>
          </Link>
        </section>
      )}
    </div>
  )
}
