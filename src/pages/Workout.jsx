import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { EX_BY_ID } from '../lib/exercises'
import { fmtDuration, fmtVolume, fmtKg, today, num } from '../lib/calc'
import {
  useActive, setActive, clearActive, newExercise, newSet, loadWorkouts, buildIndex,
  saveWorkout, findRecords, markTrainingHabit, exerciseStats, workoutVolume,
} from '../lib/workout'
import ExerciseMedia from '../components/ExerciseMedia'
import ExercisePicker from '../components/ExercisePicker'
import Modal from '../components/Modal'
import Icon from '../components/Icon'

const RPE = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']
const REST_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240]

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.18, 0.36].forEach((t, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = i === 2 ? 1046 : 784
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.15)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.16)
    })
  } catch { /* sin audio */ }
  navigator.vibrate?.([200, 80, 200])
}

// Mantiene la pantalla encendida mientras entrenas (si el navegador lo permite)
function useWakeLock(on) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let lock
    const req = () => navigator.wakeLock.request('screen').then((l) => { lock = l }).catch(() => {})
    req()
    const onVis = () => document.visibilityState === 'visible' && req()
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); lock?.release?.() }
  }, [on])
}

const fmtPrev = (s) => `${num(s.kg) ? fmtKg(num(s.kg)) : 'PC'}×${s.reps || '—'}`
const fmtSet = (s) => (s ? `${num(s.kg) ? `${fmtKg(num(s.kg))} kg` : 'PC'} × ${s.reps || '—'}${s.rpe ? ` @${s.rpe}` : ''}` : '—')

export default function Workout() {
  const active = useActive()
  const { user } = useAuth()
  const nav = useNavigate()
  const [, tick] = useState(0)
  const [index, setIndex] = useState({})
  const [picker, setPicker] = useState(false)
  const [menu, setMenu] = useState(null) // índice del ejercicio con opciones abiertas
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const fired = useRef(null)

  useWakeLock(!!active && !summary)

  useEffect(() => { loadWorkouts(300).then((w) => setIndex(buildIndex(w))).catch(() => {}) }, [])
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t) }, [])

  // Aviso al terminar el descanso
  const rest = active?.rest
  const restLeft = rest ? Math.ceil((rest.endsAt - Date.now()) / 1000) : null
  useEffect(() => {
    if (!rest || restLeft > 0 || fired.current === rest.endsAt) return
    fired.current = rest.endsAt
    beep()
    const t = setTimeout(() => setActive((a) => (a?.rest?.endsAt === rest.endsAt ? { ...a, rest: null } : a)), 1500)
    return () => clearTimeout(t)
  }, [rest, restLeft])

  const totals = useMemo(() => {
    const all = (active?.exercises || []).flatMap((x) => x.sets)
    return { done: all.filter((s) => s.done).length, total: all.length }
  }, [active])

  if (summary) return <Summary summary={summary} onClose={() => nav('/')} />
  if (!active) {
    return (
      <div className="page page--narrow">
        <div className="card empty-state">
          <Icon name="dumbbell" size={32} />
          <h2>No hay entrenamiento en curso</h2>
          <button className="btn btn--primary" onClick={() => nav('/')}>Ir al inicio</button>
        </div>
      </div>
    )
  }

  const upd = (fn) => setActive((a) => (a ? fn(a) : a))
  const updEx = (ei, fn) => upd((a) => ({ ...a, exercises: a.exercises.map((x, i) => (i === ei ? fn(x) : x)) }))
  const updSet = (ei, si, patch) => updEx(ei, (x) => ({ ...x, sets: x.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) }))
  const prevOf = (id) => index[id]?.sessions?.[0]?.sets || []

  const toggle = (ei, si) => {
    const x = active.exercises[ei]
    const s = x.sets[si]
    if (s.done) return updSet(ei, si, { done: false })
    const prev = prevOf(x.id)[si]
    const patch = { done: true }
    if (s.kg === '' && prev?.kg) patch.kg = prev.kg
    if (s.reps === '') patch.reps = prev?.reps || String(x.reps).match(/\d+/)?.[0] || ''
    const isLast = totals.done + 1 === totals.total
    upd((a) => ({
      ...a,
      exercises: a.exercises.map((ex, i) => (i !== ei ? ex : { ...ex, sets: ex.sets.map((st, j) => (j === si ? { ...st, ...patch } : st)) })),
      rest: isLast ? null : { endsAt: Date.now() + x.rest_sec * 1000, total: x.rest_sec, name: EX_BY_ID[x.id]?.nombre },
    }))
  }

  const addSet = (ei) => updEx(ei, (x) => {
    const last = x.sets[x.sets.length - 1]
    return { ...x, sets: [...x.sets, last ? { kg: last.kg, reps: last.reps, rpe: '', done: false } : newSet(x.reps)] }
  })
  const removeSet = (ei) => updEx(ei, (x) => (x.sets.length > 1 ? { ...x, sets: x.sets.slice(0, -1) } : x))
  const addExercises = (ids) => upd((a) => ({ ...a, exercises: [...a.exercises, ...ids.map((id) => newExercise(id))] }))
  const moveEx = (ei, d) => upd((a) => {
    const ex = [...a.exercises]
    const j = ei + d
    if (j < 0 || j >= ex.length) return a
    ;[ex[ei], ex[j]] = [ex[j], ex[ei]]
    return { ...a, exercises: ex }
  })
  const removeEx = (ei) => {
    if (!confirm(`¿Quitar ${EX_BY_ID[active.exercises[ei].id]?.nombre} de este entrenamiento?`)) return
    upd((a) => ({ ...a, exercises: a.exercises.filter((_, i) => i !== ei) }))
    setMenu(null)
  }

  const pending = active.exercises
    .map((x) => ({ name: EX_BY_ID[x.id]?.nombre, left: x.sets.filter((s) => !s.done).length }))
    .filter((p) => p.left > 0)

  const tryFinish = () => {
    if (totals.done === 0) return setError('Marca al menos una serie como hecha (✓) para guardar.')
    setError(null)
    pending.length ? setConfirmOpen(true) : finish()
  }

  const finish = async () => {
    setConfirmOpen(false)
    setSaving(true)
    try {
      const snapshot = active
      const saved = await saveWorkout(snapshot, user.id)
      await markTrainingHabit(user.id, today())
      setSummary({ workout: saved, records: findRecords(saved.log, index), templateId: snapshot.templateId, exercises: snapshot.exercises })
      clearActive()
    } catch (e) {
      setError(`No se pudo guardar: ${e.message}. Tu entrenamiento sigue aquí; intenta de nuevo.`)
    }
    setSaving(false)
  }

  const discard = () => {
    if (!confirm('¿Descartar este entrenamiento? No se guardará nada.')) return
    clearActive()
    nav('/')
  }

  const elapsed = (Date.now() - active.startedAt) / 1000
  const pct = totals.total ? totals.done / totals.total : 0
  const m = menu != null ? active.exercises[menu] : null

  return (
    <div className="workout">
      <header className="wbar">
        <button className="icon-btn" onClick={discard} aria-label="Descartar entrenamiento"><Icon name="x" /></button>
        <div className="wbar__mid">
          <input className="wbar__name" value={active.name} onChange={(e) => upd((a) => ({ ...a, name: e.target.value }))} aria-label="Nombre del entrenamiento" maxLength={60} />
          <span className="wbar__time">{fmtDuration(elapsed)}</span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={tryFinish} disabled={saving}>{saving ? 'Guardando…' : 'Terminar'}</button>
        <div className="wbar__progress"><span style={{ transform: `scaleX(${pct})` }} /></div>
      </header>

      {error && <p className="notice notice--err wnotice">{error}</p>}

      {active.exercises.length === 0 ? (
        <div className="card empty-state wempty">
          <Icon name="dumbbell" size={32} />
          <h2>Entrenamiento libre</h2>
          <p className="muted">Agrega el primer ejercicio y empieza a anotar tus series.</p>
          <button className="btn btn--primary" onClick={() => setPicker(true)}><Icon name="plus" size={18} /> Agregar ejercicio</button>
        </div>
      ) : (
        <ol className="wlist">
          {active.exercises.map((x, ei) => {
            const ex = EX_BY_ID[x.id]
            const prev = prevOf(x.id)
            const allDone = x.sets.every((s) => s.done)
            return (
              <li key={x.uid} className={`wcard ${allDone ? 'is-done' : ''}`}>
                <div className="wcard__head">
                  <ExerciseMedia id={x.id} size="lg" />
                  <div className="wcard__info">
                    <h3>{ex?.nombre || x.id}</h3>
                    <p className="muted small">Meta {x.sets.length} × {x.reps} · descanso {x.rest_sec} s</p>
                    {index[x.id]?.best1rm > 0 && <p className="small accent">Mejor 1RM estimado: {fmtKg(index[x.id].best1rm)} kg</p>}
                  </div>
                  <button className="icon-btn" onClick={() => setMenu(ei)} aria-label={`Opciones de ${ex?.nombre}`}><Icon name="dots" /></button>
                </div>
                {x.note !== undefined && (
                  <input className="wcard__note" value={x.note} onChange={(e) => updEx(ei, (o) => ({ ...o, note: e.target.value }))} placeholder="Nota: asiento, agarre, sensaciones…" maxLength={120} />
                )}

                <div className="sets" role="table" aria-label={`Series de ${ex?.nombre}`}>
                  <div className="set set--head" role="row">
                    <span role="columnheader">Serie</span><span role="columnheader">Anterior</span><span role="columnheader">Kg</span>
                    <span role="columnheader">Reps</span><span role="columnheader">RPE</span><span role="columnheader"><Icon name="check" size={14} /></span>
                  </div>
                  {x.sets.map((s, si) => {
                    const p = prev[si]
                    return (
                      <motion.div key={si} role="row" className={`set ${s.done ? 'is-done' : ''}`} layout="position">
                        <span className="set__n">{si + 1}</span>
                        <button type="button" className="set__prev" disabled={!p} onClick={() => p && updSet(ei, si, { kg: p.kg, reps: p.reps })}
                          aria-label={p ? `Usar lo de la vez pasada: ${fmtSet(p)}` : 'Sin registro anterior'}>{p ? fmtPrev(p) : '—'}</button>
                        <input inputMode="decimal" value={s.kg} placeholder={p?.kg || '0'} onChange={(e) => updSet(ei, si, { kg: e.target.value })} aria-label={`Kilos serie ${si + 1}`} />
                        <input inputMode="numeric" value={s.reps} placeholder={p?.reps || String(x.reps).match(/\d+/)?.[0] || ''} onChange={(e) => updSet(ei, si, { reps: e.target.value })} aria-label={`Repeticiones serie ${si + 1}`} />
                        <select value={s.rpe} onChange={(e) => updSet(ei, si, { rpe: e.target.value })} aria-label={`RPE serie ${si + 1}`} className={s.rpe ? 'has-val' : ''}>
                          <option value="">—</option>
                          {RPE.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <motion.button type="button" className="set__check" onClick={() => toggle(ei, si)} whileTap={{ scale: 0.85 }}
                          aria-pressed={s.done} aria-label={s.done ? `Desmarcar serie ${si + 1}` : `Marcar serie ${si + 1} como hecha`}>
                          <Icon name="check" size={18} stroke={2.8} />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="wcard__foot">
                  <button className="btn btn--ghost btn--sm" onClick={() => removeSet(ei)} disabled={x.sets.length <= 1}><Icon name="minus" size={16} /> Serie</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => addSet(ei)}><Icon name="plus" size={16} /> Serie</button>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {active.exercises.length > 0 && (
        <div className="wactions">
          <button className="btn btn--ghost btn--block" onClick={() => setPicker(true)}><Icon name="plus" size={18} /> Agregar ejercicio</button>
          <p className="muted small center">RPE: qué tan pesada se sintió la serie. 10 = no podías ni una más · 8 = te quedaban 2.</p>
        </div>
      )}

      <AnimatePresence>
        {rest && (
          <motion.div className="rest" initial={{ y: '120%' }} animate={{ y: 0 }} exit={{ y: '120%' }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} role="timer" aria-label="Descanso">
            <svg className="rest__ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="44" />
              <circle cx="50" cy="50" r="44" style={{ strokeDashoffset: 276.5 * (1 - Math.max(0, restLeft) / rest.total) }} />
            </svg>
            <div className="rest__body">
              <span className="small muted">{restLeft > 0 ? 'Descanso' : '¡A la siguiente serie!'}</span>
              <strong className="rest__time">{fmtDuration(Math.max(0, restLeft))}</strong>
              <span className="small muted">{rest.name}</span>
            </div>
            <div className="rest__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => upd((a) => ({ ...a, rest: { ...a.rest, endsAt: a.rest.endsAt + 15000, total: a.rest.total + 15 } }))}>+15 s</button>
              <button className="btn btn--primary btn--sm" onClick={() => upd((a) => ({ ...a, rest: null }))}>Saltar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={!!m} onClose={() => setMenu(null)} title={m ? EX_BY_ID[m.id]?.nombre : ''}>
        {m && (
          <div className="opts">
            <label className="field">
              <span>Descanso entre series</span>
              <select value={m.rest_sec} onChange={(e) => updEx(menu, (x) => ({ ...x, rest_sec: Number(e.target.value) }))}>
                {REST_OPTIONS.map((s) => <option key={s} value={s}>{s} segundos</option>)}
              </select>
            </label>
            <button className="opt" onClick={() => { updEx(menu, (x) => ({ ...x, note: x.note || '' })); setMenu(null) }}><Icon name="note" /> Agregar nota</button>
            <button className="opt" onClick={() => { moveEx(menu, -1); setMenu(null) }} disabled={menu === 0}><Icon name="up" /> Mover arriba</button>
            <button className="opt" onClick={() => { moveEx(menu, 1); setMenu(null) }} disabled={menu === active.exercises.length - 1}><Icon name="down" /> Mover abajo</button>
            <button className="opt opt--danger" onClick={() => removeEx(menu)}><Icon name="trash" /> Quitar ejercicio</button>
          </div>
        )}
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Te faltan series por marcar">
        <ul className="pending">
          {pending.map((p, i) => <li key={i}><strong>{p.name}</strong> <span className="muted">· {p.left} {p.left === 1 ? 'serie' : 'series'}</span></li>)}
        </ul>
        <p className="muted small">Las series sin marcar no cuentan para tu progreso.</p>
        <div className="row row--end">
          <button className="btn btn--ghost" onClick={finish}>Terminar así</button>
          <button className="btn btn--primary" onClick={() => setConfirmOpen(false)}>Seguir</button>
        </div>
      </Modal>

      <ExercisePicker open={picker} onClose={() => setPicker(false)} onPick={addExercises} />
    </div>
  )
}

function Summary({ summary, onClose }) {
  const { workout: w, records, templateId, exercises } = summary
  const { user } = useAuth()
  const [savedTpl, setSavedTpl] = useState(false)

  const saveAsTemplate = async () => {
    const name = prompt('Nombre de la rutina', w.day_name === 'Entrenamiento libre' ? '' : w.day_name)
    if (!name?.trim()) return
    const { error } = await supabase.from('workout_templates').insert({
      user_id: user.id,
      name: name.trim(),
      exercises: exercises.map((x) => ({ id: x.id, sets: x.sets.length, reps: x.sets.find((s) => s.done)?.reps || x.reps, rest_sec: x.rest_sec, note: x.note || '' })),
    })
    if (error) alert(error.message)
    else setSavedTpl(true)
  }

  return (
    <div className="page page--narrow summary">
      <motion.div className="summary__badge" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
        <Icon name={records.length ? 'trophy' : 'check'} size={44} stroke={2.4} />
      </motion.div>
      <h1 className="display display--sm center">{records.length ? '¡Nuevos récords!' : 'Entrenamiento guardado'}</h1>
      <p className="muted center">{w.day_name}</p>

      <div className="kpis kpis--big card">
        <div><strong>{fmtDuration(w.duration_sec)}</strong><span>tiempo</span></div>
        <div><strong>{fmtVolume(workoutVolume(w.log))}</strong><span>volumen</span></div>
        <div><strong>{w.sets_done}</strong><span>series</span></div>
      </div>

      {records.length > 0 && (
        <section className="card">
          <h2 className="card__title"><Icon name="trophy" size={18} /> Récords</h2>
          <ul className="records">
            {records.map((r, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                <span>{EX_BY_ID[r.id]?.nombre}</span><span className="muted small">{r.kind}</span><strong>{r.value}</strong>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="card__title">Mejor serie de cada ejercicio</h2>
        <ul className="bestsets">
          {w.log.map((x, i) => {
            const st = exerciseStats(x.sets)
            return st.top ? <li key={i}><span>{EX_BY_ID[x.id]?.nombre}</span><strong>{fmtSet(st.top)}</strong></li> : null
          })}
        </ul>
      </section>

      <div className="row row--end">
        {!templateId && !savedTpl && <button className="btn btn--ghost" onClick={saveAsTemplate}><Icon name="copy" size={16} /> Guardar como rutina</button>}
        {savedTpl && <span className="ok small">Rutina guardada</span>}
        <button className="btn btn--primary" onClick={onClose}>Listo</button>
      </div>
    </div>
  )
}
