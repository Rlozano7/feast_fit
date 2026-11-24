import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWorkouts } from '../lib/useData'
import { workoutVolume } from '../lib/workout'
import { EX_BY_ID } from '../lib/exercises'
import { MONTHS, fmtMinutes, fmtVolume, longDate } from '../lib/calc'
import Icon from '../components/Icon'

export default function History() {
  const { workouts, error } = useWorkouts(500)

  const groups = useMemo(() => {
    const g = []
    for (const w of workouts || []) {
      const d = new Date(w.started_at)
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      if (g[g.length - 1]?.key !== key) g.push({ key, items: [] })
      g[g.length - 1].items.push(w)
    }
    return g
  }, [workouts])

  return (
    <div className="page">
      <header className="pagehead"><h1 className="display display--sm">Historial</h1></header>
      {error && <p className="notice notice--err">{error}</p>}
      {workouts === undefined ? <div className="card"><span className="spinner" /></div> : workouts.length === 0 ? (
        <div className="card empty-state">
          <Icon name="clock" size={32} />
          <h2>Todavía no hay entrenamientos</h2>
          <p className="muted">Cuando termines el primero aparecerá aquí con todas sus series.</p>
        </div>
      ) : groups.map((g) => (
        <section key={g.key}>
          <div className="sechead">
            <h2 className="cap">{g.key}</h2>
            <span className="muted small">{g.items.length} {g.items.length === 1 ? 'entrenamiento' : 'entrenamientos'}</span>
          </div>
          <ul className="hlist">
            {g.items.map((w) => (
              <li key={w.id}>
                <Link to={`/historial/${w.id}`} className="card wsum">
                  <div className="row row--between">
                    <strong>{w.day_name}</strong>
                    <span className="muted small">{longDate(w.started_at)}</span>
                  </div>
                  <p className="muted small">{fmtMinutes(w.duration_sec)} · {fmtVolume(workoutVolume(w.log))} · {w.sets_done} series</p>
                  <p className="small wsum__ex">{(w.log || []).map((x) => EX_BY_ID[x.id]?.nombre).filter(Boolean).join(' · ')}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
