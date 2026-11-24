import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useStart } from '../lib/useData'
import { EX_BY_ID } from '../lib/exercises'
import ExerciseMedia from '../components/ExerciseMedia'
import ExercisePicker from '../components/ExercisePicker'
import Icon from '../components/Icon'

const REST_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240]

export default function TemplateEdit() {
  const { id } = useParams()
  const isNew = id === 'nueva'
  const { user } = useAuth()
  const nav = useNavigate()
  const start = useStart()
  const [t, setT] = useState(isNew ? { name: '', notes: '', exercises: [] } : null)
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (isNew) return
    supabase.from('workout_templates').select('*').eq('id', id).maybeSingle().then(({ data }) => setT(data || false))
  }, [id, isNew])

  if (t === null) return <div className="page"><span className="spinner" /></div>
  if (t === false) return <div className="page"><p className="empty">No encontramos esta rutina.</p></div>

  const setEx = (i, patch) => setT({ ...t, exercises: t.exercises.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
  const move = (i, d) => {
    const ex = [...t.exercises]
    const j = i + d
    if (j < 0 || j >= ex.length) return
    ;[ex[i], ex[j]] = [ex[j], ex[i]]
    setT({ ...t, exercises: ex })
  }
  const remove = (i) => setT({ ...t, exercises: t.exercises.filter((_, j) => j !== i) })
  const add = (ids) => setT({ ...t, exercises: [...t.exercises, ...ids.map((x) => ({ id: x, sets: 3, reps: '10', rest_sec: 90, note: '' }))] })

  const save = async () => {
    if (!t.name.trim()) return setErr('Ponle nombre a la rutina.')
    if (!t.exercises.length) return setErr('Agrega al menos un ejercicio.')
    setBusy(true)
    setErr(null)
    const row = { name: t.name.trim(), notes: t.notes || null, exercises: t.exercises, updated_at: new Date().toISOString() }
    const q = isNew
      ? supabase.from('workout_templates').insert({ ...row, user_id: user.id })
      : supabase.from('workout_templates').update(row).eq('id', id)
    const { error } = await q
    setBusy(false)
    if (error) return setErr(/workout_templates/.test(error.message) ? 'Falta crear la tabla de rutinas en Supabase (archivo supabase/carga.sql).' : error.message)
    nav('/rutinas')
  }

  const del = async () => {
    if (!confirm(`¿Borrar la rutina "${t.name}"? Tu historial no se borra.`)) return
    await supabase.from('workout_templates').delete().eq('id', id)
    nav('/rutinas')
  }

  return (
    <div className="page">
      <header className="pagehead">
        <button className="icon-btn" onClick={() => nav('/rutinas')} aria-label="Volver"><Icon name="back" /></button>
        <h1 className="h-page">{isNew ? 'Nueva rutina' : 'Editar rutina'}</h1>
        {!isNew ? <button className="icon-btn icon-btn--danger" onClick={del} aria-label="Borrar rutina"><Icon name="trash" /></button> : <span />}
      </header>

      <section className="card">
        <label className="field">
          <span>Nombre</span>
          <input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} placeholder="Ej. Pecho y tríceps" maxLength={60} />
        </label>
        <label className="field">
          <span>Notas (opcional)</span>
          <input value={t.notes || ''} onChange={(e) => setT({ ...t, notes: e.target.value })} placeholder="Ej. calentar 10 min en caminadora" maxLength={200} />
        </label>
      </section>

      <ol className="edlist">
        {t.exercises.map((x, i) => (
          <li key={`${x.id}-${i}`} className="card edrow">
            <div className="edrow__head">
              <ExerciseMedia id={x.id} />
              <strong className="edrow__name">{EX_BY_ID[x.id]?.nombre || x.id}</strong>
              <div className="edrow__tools">
                <button className="icon-btn icon-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir"><Icon name="up" size={18} /></button>
                <button className="icon-btn icon-btn--sm" onClick={() => move(i, 1)} disabled={i === t.exercises.length - 1} aria-label="Bajar"><Icon name="down" size={18} /></button>
                <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => remove(i)} aria-label="Quitar"><Icon name="x" size={18} /></button>
              </div>
            </div>
            <div className="edrow__grid">
              <label className="field field--sm">
                <span>Series</span>
                <div className="stepper">
                  <button type="button" onClick={() => setEx(i, { sets: Math.max(1, Number(x.sets) - 1) })} aria-label="Menos series"><Icon name="minus" size={16} /></button>
                  <output>{x.sets}</output>
                  <button type="button" onClick={() => setEx(i, { sets: Math.min(10, Number(x.sets) + 1) })} aria-label="Más series"><Icon name="plus" size={16} /></button>
                </div>
              </label>
              <label className="field field--sm">
                <span>Reps</span>
                <input value={x.reps} onChange={(e) => setEx(i, { reps: e.target.value })} placeholder="10 o 8-12" maxLength={10} />
              </label>
              <label className="field field--sm">
                <span>Descanso</span>
                <select value={x.rest_sec} onChange={(e) => setEx(i, { rest_sec: Number(e.target.value) })}>
                  {REST_OPTIONS.map((s) => <option key={s} value={s}>{s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`}</option>)}
                </select>
              </label>
            </div>
            <input className="edrow__note" value={x.note || ''} onChange={(e) => setEx(i, { note: e.target.value })} placeholder="Nota (ej. asiento en 4, agarre cerrado)" maxLength={120} />
          </li>
        ))}
      </ol>

      <button className="btn btn--ghost btn--block" onClick={() => setPicker(true)}><Icon name="plus" size={18} /> Agregar ejercicios</button>

      {err && <p className="notice notice--err">{err}</p>}
      <div className="row row--end stickyfoot">
        {!isNew && <button className="btn btn--ghost" onClick={() => start({ name: t.name, templateId: id, exercises: t.exercises })}><Icon name="play" size={14} /> Empezar</button>}
        <button className="btn btn--primary" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar rutina'}</button>
      </div>

      <ExercisePicker open={picker} onClose={() => setPicker(false)} onPick={add} />
    </div>
  )
}
