import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWorkouts } from '../lib/useData'
import { buildIndex } from '../lib/workout'
import { GROUP_LABEL } from '../lib/exercises'
import { fmtKg, shortDate } from '../lib/calc'
import { useExerciseFilter, ExerciseFilters } from '../components/ExercisePicker'
import { Animated } from '../components/ExerciseMedia'

export default function Exercises() {
  const { workouts } = useWorkouts(500)
  const index = useMemo(() => buildIndex(workouts || []), [workouts])
  const f = useExerciseFilter()

  // Primero los que ya has hecho (más recientes arriba)
  const list = useMemo(() => [...f.list].sort((a, b) => {
    const da = index[a.id]?.sessions[0]?.date || ''
    const db = index[b.id]?.sessions[0]?.date || ''
    return db.localeCompare(da)
  }), [f.list, index])

  return (
    <div className="page">
      <header className="pagehead"><h1 className="display display--sm">Ejercicios</h1></header>
      <ExerciseFilters f={f} />
      <ul className="exgrid">
        {list.map((e) => {
          const s = index[e.id]
          return (
            <li key={e.id}>
              <Link to={`/ejercicios/${e.id}`} className="excard">
                <Animated id={e.id} playing={false} className="excard__img" />
                <div className="excard__txt">
                  <strong>{e.nombre}</strong>
                  <span className="muted small">{GROUP_LABEL[e.grupo]} · {e.equipo}</span>
                  {s ? (
                    <span className="small accent">{s.maxKg ? `Máx ${fmtKg(s.maxKg)} kg` : `Máx ${s.maxReps} reps`} · {s.sessions.length}× · {shortDate(s.sessions[0].date)}</span>
                  ) : <span className="small muted">Sin registros</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
