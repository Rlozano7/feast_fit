import { useMemo, useState } from 'react'
import { EXERCISES, GROUP_LABEL } from '../lib/exercises'
import { Animated } from './ExerciseMedia'
import Modal from './Modal'
import Icon from './Icon'

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function useExerciseFilter() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('todos')
  const [place, setPlace] = useState('todos')
  const list = useMemo(() => {
    const t = norm(q.trim())
    return EXERCISES.filter((e) =>
      (group === 'todos' || e.grupo === group) &&
      (place === 'todos' || (place === 'maquina' ? /máquina|polea/i.test(e.equipo) : e.lugar.includes(place))) &&
      (!t || norm(`${e.nombre} ${e.equipo}`).includes(t)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [q, group, place])
  return { q, setQ, group, setGroup, place, setPlace, list }
}

export function ExerciseFilters({ f }) {
  return (
    <div className="filters">
      <label className="search">
        <Icon name="search" size={18} />
        <input value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="Buscar ejercicio" aria-label="Buscar ejercicio" />
      </label>
      <div className="chips-scroll" role="group" aria-label="Lugar o equipo">
        {[['todos', 'Todo'], ['maquina', 'Máquinas y poleas'], ['gimnasio', 'Gimnasio'], ['casa', 'Casa']].map(([v, l]) => (
          <button key={v} type="button" className={`pill ${f.place === v ? 'is-on' : ''}`} aria-pressed={f.place === v} onClick={() => f.setPlace(v)}>{l}</button>
        ))}
      </div>
      <div className="chips-scroll" role="group" aria-label="Grupo muscular">
        {[['todos', 'Todos'], ...Object.entries(GROUP_LABEL)].map(([v, l]) => (
          <button key={v} type="button" className={`pill pill--soft ${f.group === v ? 'is-on' : ''}`} aria-pressed={f.group === v} onClick={() => f.setGroup(v)}>{l}</button>
        ))}
      </div>
    </div>
  )
}

// Ventana para elegir uno o varios ejercicios
export default function ExercisePicker({ open, onClose, onPick, title = 'Agregar ejercicios' }) {
  const f = useExerciseFilter()
  const [sel, setSel] = useState([])

  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const close = () => { setSel([]); onClose() }
  const confirm = () => { onPick(sel); close() }

  return (
    <Modal open={open} onClose={close} title={title} wide>
      <ExerciseFilters f={f} />
      <ul className="picklist">
        {f.list.map((e) => {
          const on = sel.includes(e.id)
          return (
            <li key={e.id}>
              <button type="button" className={`pick ${on ? 'is-on' : ''}`} onClick={() => toggle(e.id)} aria-pressed={on}>
                <Animated id={e.id} playing={false} className="pick__img" />
                <span className="pick__txt">
                  <strong>{e.nombre}</strong>
                  <span className="muted small">{GROUP_LABEL[e.grupo]} · {e.equipo}</span>
                </span>
                <span className="pick__mark">{on ? sel.indexOf(e.id) + 1 : <Icon name="plus" size={16} />}</span>
              </button>
            </li>
          )
        })}
        {f.list.length === 0 && <li className="empty">No hay ejercicios con ese filtro.</li>}
      </ul>
      <div className="modal__foot">
        <button className="btn btn--primary btn--block" disabled={!sel.length} onClick={confirm}>
          {sel.length ? `Agregar ${sel.length} ${sel.length === 1 ? 'ejercicio' : 'ejercicios'}` : 'Elige ejercicios'}
        </button>
      </div>
    </Modal>
  )
}
