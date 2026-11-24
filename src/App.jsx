import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Templates from './pages/Templates'
import TemplateEdit from './pages/TemplateEdit'
import Workout from './pages/Workout'
import History from './pages/History'
import WorkoutDetail from './pages/WorkoutDetail'
import Exercises from './pages/Exercises'
import ExerciseDetail from './pages/ExerciseDetail'

export default function App() {
  const { session } = useAuth()
  if (session === undefined) return <div className="splash"><span className="spinner" /></div>
  if (!session) return <Auth />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rutinas" element={<Templates />} />
        <Route path="/rutinas/:id" element={<TemplateEdit />} />
        <Route path="/entrenar" element={<Workout />} />
        <Route path="/historial" element={<History />} />
        <Route path="/historial/:id" element={<WorkoutDetail />} />
        <Route path="/ejercicios" element={<Exercises />} />
        <Route path="/ejercicios/:id" element={<ExerciseDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
