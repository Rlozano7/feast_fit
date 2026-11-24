import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStart } from '../lib/useData'
import { exerciseStats, workoutVolume } from '../lib/workout'
import { EX_BY_ID } from '../lib/exercises'
import { fmtDuration, fmtVolume, fmtKg, longDate, num } from '../lib/calc'
import ExerciseMedia from '../components/ExerciseMedia'
import Icon from '../components/Icon'

export default function WorkoutDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const start = useStart()
  const [w, setW] = useState(null)

  useEffect(() => {
    supabase.from('workouts').select('*').eq('id', id).maybeSingle().then(({ data }) => setW(data || false))
  }, [id])

  if (w === null) return <div className="page"><span className="spinner" /></div>
  if (w === false) return <div className="page"><p className="empty">No encontramos este entrenamiento.</p></div>

  const del = async () => {
    if (!confirm('¿Borrar este entrenamiento del historial? No se puede deshacer.')) return
    await supabase.from('workouts').delete().eq('id', id)
    nav('/historial')
  }

  const repeat = () => start({
    name: w.day_name,
    exercises: (w.log || []).filter((x) => EX_BY_ID[x.id]).map((x) => ({ id: x.id, sets: x.sets.length, reps: x.sets.find((s) => s.done)?.reps || '10', rest_sec: 90 })),
  })

  return (
    <div className="page">
      <header className="pagehead">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Volver"><Icon name="back" /></button>
        <h1 className="h-page">{w.day_name}</h1>
        <button className="icon-btn icon-btn--danger" onClick={del} aria-label="Borrar entrenamiento"><Icon name="trash" /></button>
      </header>
      <p className="muted">{longDate(w.started_at)} · {new Date(w.started_at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</p>

      <div className="kpis card">
        <div><strong>{fmtDuration(w.duration_sec)}</strong><span>tiempo</span></div>
        <div><strong>{fmtVolume(workoutVolume(w.log))}</strong><span>volumen</span></div>
        <div><strong>{w.sets_done}/{w.sets_total}</strong><span>series</span></div>
      </div>

      <ul className="dlist">
        {(w.log || []).map((x, i) => {
          const st = exerciseStats(x.sets)
          return (
            <li key={i} className="card">
              <div className="dhead">
                <ExerciseMedia id={x.id} />
                <div>
                  <Link to={`/ejercicios/${x.id}`} className="dname">{EX_BY_ID[x.id]?.nombre || x.id}</Link>
                  {st.best1rm > 0 && <p className="muted small">1RM estimado {fmtKg(st.best1rm)} kg · volumen {fmtVolume(st.volume)}</p>}
                </div>
              </div>
              {x.note && <p className="small dnote">{x.note}</p>}
              <table className="dtable">
                <thead><tr><th>Serie</th><th>Kg</th><th>Reps</th><th>RPE</th></tr></thead>
                <tbody>
                  {x.sets.map((s, j) => (
                    <tr key={j} className={s.done ? '' : 'is-skip'}>
                      <td>{j + 1}</td><td>{num(s.kg) ? fmtKg(num(s.kg)) : '—'}</td><td>{s.reps || '—'}</td><td>{s.rpe || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          )
        })}
      </ul>

      <button className="btn btn--ghost btn--block" onClick={repeat}><Icon name="play" size={14} /> Repetir este entrenamiento</button>
    </div>
  )
}
