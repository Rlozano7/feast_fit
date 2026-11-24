import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { e1rm, num } from './calc'

// ------------------------------------------------------------
// Entrenamiento en curso: vive en el teléfono (localStorage) para
// que no se pierda si cierras la app o se apaga la pantalla.
// ------------------------------------------------------------
const KEY = 'carga-activo'
const listeners = new Set()
let cache

function read() {
  if (cache !== undefined) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY)) || null } catch { cache = null }
  return cache
}

function write(v) {
  cache = v
  try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY) } catch { /* sin almacenamiento */ }
  listeners.forEach((l) => l())
}

export const getActive = read
export const setActive = (fn) => write(typeof fn === 'function' ? fn(read()) : fn)
export const clearActive = () => write(null)

export function useActive() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, read)
}

let uidN = 0
export const uid = () => `${Date.now().toString(36)}${(uidN++).toString(36)}`

// Kg y reps empiezan vacíos: se muestran como sugerencia (lo de la vez pasada o la meta)
// y se llenan solos al marcar la serie si no escribes nada.
export const newSet = () => ({ kg: '', reps: '', rpe: '', done: false })

export const newExercise = (id, { sets = 3, reps = '10', rest_sec = 90, note = '' } = {}) => ({
  uid: uid(), id, reps: String(reps), rest_sec: Number(rest_sec) || 90, note: note || undefined,
  sets: Array.from({ length: Math.max(1, Number(sets) || 1) }, () => newSet()),
})

// plan = { name, templateId?, routineId?, exercises: [{ id, sets, reps, rest_sec, note }] }
export function startWorkout(plan) {
  write({
    name: plan.name || 'Entrenamiento libre',
    templateId: plan.templateId || null,
    routineId: plan.routineId || null,
    startedAt: Date.now(),
    rest: null,
    exercises: (plan.exercises || []).map((x) => newExercise(x.id, x)),
  })
}

// ------------------------------------------------------------
// Historial y estadísticas
// ------------------------------------------------------------
export const doneSets = (sets = []) => sets.filter((s) => s.done && (num(s.reps) > 0 || num(s.kg) > 0))

export function exerciseStats(sets) {
  const d = doneSets(sets)
  return {
    count: d.length,
    volume: d.reduce((a, s) => a + num(s.kg) * num(s.reps), 0),
    maxKg: d.reduce((a, s) => Math.max(a, num(s.kg)), 0),
    maxReps: d.reduce((a, s) => Math.max(a, num(s.reps)), 0),
    best1rm: d.reduce((a, s) => Math.max(a, e1rm(s.kg, s.reps)), 0),
    top: d.reduce((best, s) => (!best || e1rm(s.kg, s.reps) > e1rm(best.kg, best.reps) ? s : best), null),
  }
}

export function workoutVolume(log = []) {
  return log.reduce((a, x) => a + exerciseStats(x.sets).volume, 0)
}

export async function loadWorkouts(limit = 300) {
  const { data, error } = await supabase.from('workouts').select('*').order('started_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

// Índice por ejercicio: sesiones (de la más reciente a la más vieja) y récords
export function buildIndex(workouts) {
  const idx = {}
  for (const w of workouts) {
    for (const x of w.log || []) {
      const st = exerciseStats(x.sets)
      if (!st.count) continue
      const e = (idx[x.id] ||= { sessions: [], best1rm: 0, maxKg: 0, maxReps: 0, maxVolume: 0 })
      e.sessions.push({ workoutId: w.id, date: w.started_at, name: w.day_name, sets: doneSets(x.sets), ...st })
      e.best1rm = Math.max(e.best1rm, st.best1rm)
      e.maxKg = Math.max(e.maxKg, st.maxKg)
      e.maxReps = Math.max(e.maxReps, st.maxReps)
      e.maxVolume = Math.max(e.maxVolume, st.volume)
    }
  }
  return idx
}

// Récords nuevos de un entrenamiento comparado con todo lo anterior
export function findRecords(log, index) {
  const out = []
  for (const x of log) {
    const prev = index[x.id]
    if (!prev) continue // primera vez: no cuenta como récord
    const st = exerciseStats(x.sets)
    if (!st.count) continue
    if (st.maxKg > prev.maxKg) out.push({ id: x.id, kind: 'Peso máximo', value: `${st.maxKg} kg` })
    else if (st.best1rm > prev.best1rm + 0.05) out.push({ id: x.id, kind: '1RM estimado', value: `${Math.round(st.best1rm * 10) / 10} kg` })
    if (st.volume > prev.maxVolume && prev.maxVolume > 0) out.push({ id: x.id, kind: 'Volumen', value: `${Math.round(st.volume)} kg` })
  }
  return out
}

// Guarda el entrenamiento en la tabla "workouts" (compartida con Tráguese ese sapo)
export async function saveWorkout(active, userId) {
  const log = active.exercises.map((x) => ({
    id: x.id,
    note: x.note || undefined,
    sets: x.sets.map((s) => ({ done: !!s.done, kg: s.kg, reps: s.reps, rpe: s.rpe || undefined })),
  }))
  const all = active.exercises.flatMap((x) => x.sets)
  const setsDone = all.filter((s) => s.done).length
  const row = {
    user_id: userId,
    routine_id: active.routineId || null,
    day_name: active.name,
    started_at: new Date(active.startedAt).toISOString(),
    duration_sec: Math.round((Date.now() - active.startedAt) / 1000),
    sets_done: setsDone,
    sets_total: all.length,
    completed: setsDone === all.length && all.length > 0,
    log,
  }
  const { data, error } = await supabase.from('workouts').insert(row).select().single()
  if (error) throw error
  return data
}

// Marca el hábito "Entrenar" de hoy en Tráguese ese sapo (si lo tienes)
export async function markTrainingHabit(userId, date) {
  try {
    const { data: habits } = await supabase.from('habits').select('id,name').eq('active', true)
    const h = habits?.find((x) => /entren|ejercicio|gym|gimnasio/i.test(x.name))
    if (h) await supabase.from('habit_logs').upsert({ user_id: userId, habit_id: h.id, date }, { onConflict: 'habit_id,date' })
  } catch { /* no es indispensable */ }
}
