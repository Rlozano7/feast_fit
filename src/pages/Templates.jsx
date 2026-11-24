import { Link } from 'react-router-dom'
import { useTemplates, useStart } from '../lib/useData'
import { EX_BY_ID } from '../lib/exercises'
import Icon from '../components/Icon'

export default function Templates() {
  const { templates, error } = useTemplates()
  const start = useStart()

  return (
    <div className="page">
      <header className="pagehead">
        <h1 className="display display--sm">Rutinas</h1>
        <Link to="/rutinas/nueva" className="btn btn--primary btn--sm"><Icon name="plus" size={16} /> Nueva</Link>
      </header>
      {error && <p className="notice notice--err">{error}</p>}

      {templates === undefined ? <div className="card"><span className="spinner" /></div> : templates.length === 0 ? (
        <div className="card empty-state">
          <Icon name="list" size={32} />
          <h2>Aún no tienes rutinas</h2>
          <p className="muted">Arma tus días (por ejemplo "Pecho y tríceps" o "Pierna") con los ejercicios, series y descansos que quieras. Luego las empiezas con un toque.</p>
          <Link to="/rutinas/nueva" className="btn btn--primary">Crear rutina</Link>
        </div>
      ) : (
        <ul className="tlist">
          {templates.map((t) => (
            <li key={t.id} className="card tcard">
              <Link to={`/rutinas/${t.id}`} className="tcard__body">
                <h2>{t.name}</h2>
                <p className="muted small">{t.exercises.length} ejercicios · {t.exercises.reduce((a, x) => a + Number(x.sets || 0), 0)} series</p>
                <p className="small tcard__ex">{t.exercises.map((x) => EX_BY_ID[x.id]?.nombre).filter(Boolean).join(' · ')}</p>
              </Link>
              <button className="btn btn--primary btn--sm" onClick={() => start({ name: t.name, templateId: t.id, exercises: t.exercises })}>
                <Icon name="play" size={14} stroke={2.4} /> Empezar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
