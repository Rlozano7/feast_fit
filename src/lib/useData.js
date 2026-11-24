import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { loadWorkouts, getActive, startWorkout } from './workout'

export function useWorkouts(limit) {
  const [data, setData] = useState(undefined) // undefined = cargando
  const [error, setError] = useState(null)
  const reload = useCallback(() => {
    loadWorkouts(limit).then(setData).catch((e) => { setError(e.message); setData([]) })
  }, [limit])
  useEffect(reload, [reload])
  return { workouts: data, error, reload }
}

export function useTemplates() {
  const [data, setData] = useState(undefined)
  const [error, setError] = useState(null)
  const reload = useCallback(async () => {
    const { data: rows, error: e } = await supabase.from('workout_templates').select('*').order('updated_at', { ascending: false })
    if (e) setError(/workout_templates/.test(e.message) ? 'Falta crear la tabla de rutinas en Supabase (archivo supabase/carga.sql).' : e.message)
    setData(rows || [])
  }, [])
  useEffect(() => { reload() }, [reload])
  return { templates: data, error, reload }
}

// Rutina del mes que armó el Coach en Tráguese ese sapo (si existe)
export function useCoachRoutine() {
  const [routine, setRoutine] = useState(null)
  useEffect(() => {
    const d = new Date()
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    supabase.from('routines').select('*').eq('month', month).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => setRoutine(data?.[0] || null))
  }, [])
  return routine
}

// Empieza un entrenamiento (pide confirmación si ya hay uno en curso)
export function useStart() {
  const nav = useNavigate()
  return (plan) => {
    if (getActive() && !confirm('Ya tienes un entrenamiento en curso. ¿Descartarlo y empezar otro?')) return nav('/entrenar')
    startWorkout(plan)
    nav('/entrenar')
  }
}
