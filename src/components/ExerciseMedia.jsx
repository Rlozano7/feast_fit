import { useEffect, useState } from 'react'
import { imagesFor, fallbackImagesFor, EX_BY_ID, GROUP_LABEL } from '../lib/exercises'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import Icon from './Icon'

// Alterna las dos fotos del ejercicio para mostrar el movimiento
export function Animated({ id, playing = true, speed = 900, className = '' }) {
  const [frame, setFrame] = useState(0)
  const [srcs, setSrcs] = useState(imagesFor(id))

  useEffect(() => {
    setSrcs(imagesFor(id))
    setFrame(0)
  }, [id])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setFrame((f) => 1 - f), speed)
    return () => clearInterval(t)
  }, [playing, speed])

  const onError = () => setSrcs(fallbackImagesFor(id))

  return (
    <div className={`exmedia ${className}`}>
      {srcs.map((s, i) => (
        <img key={s} src={s} alt="" loading="lazy" onError={onError}
          className={`exmedia__frame ${frame === i ? 'is-on' : ''}`} />
      ))}
    </div>
  )
}

// Miniatura: quieta; al pasar el cursor se mueve; al hacer clic abre el detalle
export default function ExerciseMedia({ id, size = 'md' }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const ex = EX_BY_ID[id]
  if (!ex) return null

  return (
    <>
      <button type="button" className={`exthumb exthumb--${size}`} onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        aria-label={`Ver técnica de ${ex.nombre}`}>
        <Animated id={id} playing={hover} speed={650} />
        <span className="exthumb__play"><Icon name="play" size={12} stroke={2.4} /></span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={ex.nombre} wide>
        <div className="exdetail">
          <Animated id={id} playing speed={900} className="exdetail__media" />
          <div>
            <p className="chips">
              <span className="chip">{GROUP_LABEL[ex.grupo]}</span>
              <span className="chip chip--soft">{ex.equipo}</span>
            </p>
            <h4 className="exdetail__h">Técnica</h4>
            <ol className="steps">
              {ex.pasos.map((p) => <li key={p}>{p}</li>)}
            </ol>
            <p className="muted small">Movimiento animado con dos fotos: inicio y final de la repetición.</p>
            <Link className="btn btn--ghost btn--sm" to={`/ejercicios/${id}`} onClick={() => setOpen(false)}>Ver mi progreso</Link>
          </div>
        </div>
      </Modal>
    </>
  )
}
