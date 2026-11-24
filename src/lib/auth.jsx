import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthCtx = createContext(null)

// Usa los mismos usuarios de Supabase que Tráguese ese sapo
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [name, setName] = useState('')

  useEffect(() => {
    const load = async (s) => {
      setSession(s)
      if (!s) return setName('')
      const { data } = await supabase.from('profiles').select('name').eq('id', s.user.id).maybeSingle()
      setName(data?.name || s.user.email.split('@')[0])
    }
    supabase.auth.getSession().then(({ data }) => load(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => load(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return <AuthCtx.Provider value={{ session, user: session?.user, name }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
