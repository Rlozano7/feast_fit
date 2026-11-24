// Aparece si aún no se configuran las variables de Supabase
export default function SetupNotice() {
  return (
    <div className="setup">
      <div className="card">
        <h1 className="display display--sm">Falta conectar Supabase</h1>
        <p>Carga usa el mismo proyecto de Supabase que Tráguese ese sapo. Agrega estas dos variables con los mismos valores:</p>
        <pre>VITE_SUPABASE_URL{'\n'}VITE_SUPABASE_ANON_KEY</pre>
        <p className="muted">En Netlify van en <strong>Site configuration → Environment variables</strong>; después vuelve a desplegar. El archivo LEEME.md explica cada paso.</p>
      </div>
    </div>
  )
}
