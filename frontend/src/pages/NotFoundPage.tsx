import { Droplets } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
      <Droplets className="w-16 h-16 text-primary/30 mb-4" />
      <h2 className="text-3xl font-bold mb-2">Zona no encontrada</h2>
      <p className="text-text-muted mb-6">La página que buscas no existe o ha sido movida.</p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-primary rounded-lg font-semibold hover:opacity-90 transition"
      >
        Volver al Dashboard
      </Link>
    </div>
  )
}
