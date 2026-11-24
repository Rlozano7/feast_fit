import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | reset
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: window.location.origin })
        if (error) throw error
        setMsg({ ok: true, t: 'Te enviamos un enlace para cambiar tu contraseña.' })
      }
    } catch (err) {
      setMsg({ ok: false, t: /Invalid login/i.test(err.message) ? 'Correo o contraseña incorrectos.' : err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <motion.div className="auth__brand" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <img src="/favicon.svg" alt="" width="64" height="64" />
        <h1 className="display">Carga</h1>
        <p className="lead">Cada serie, cada kilo, cada repetición. Anota tu entrenamiento y mira cómo subes.</p>
      </motion.div>

      <form className="card auth__card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Entrar' : 'Recuperar acceso'}</h2>
        <p className="muted small">Usa el mismo correo y contraseña de Tráguese ese sapo.</p>
        <label className="field">
          <span>Correo</span>
          <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </label>
        {mode === 'login' && (
          <label className="field">
            <span>Contraseña</span>
            <input required type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
          </label>
        )}
        {msg && <p className={`notice ${msg.ok ? 'notice--ok' : 'notice--err'}`} role="status">{msg.t}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Enviar enlace'}
        </button>
        <button type="button" className="linkbtn" onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setMsg(null) }}>
          {mode === 'login' ? 'Olvidé mi contraseña' : 'Volver a entrar'}
        </button>
      </form>
    </div>
  )
}
