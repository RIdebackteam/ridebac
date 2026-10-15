import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { formatFare, formatDate } from '../../utils/formatters'

export default function DriverDashboard() {
  const { user } = useAuth()
  
  // Mock data for UI
  const rides = [
    { id: '1', source: 'Mumbai', destination: 'Pune', date: '2024-06-25T10:00:00Z', fare: 500, status: 'scheduled', bookedSeats: 2, totalSeats: 4 },
    { id: '2', source: 'Bangalore', destination: 'Mysore', date: '2024-06-20T08:00:00Z', fare: 300, status: 'completed', bookedSeats: 3, totalSeats: 3 }
  ]

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 container mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
          <p className="text-slate-400">Here's an overview of your rides and earnings.</p>
        </div>
        <Link to="/driver/create-ride">
          <Button icon={<Plus className="w-5 h-5"/>}>Publish New Ride</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <span className="text-slate-400 text-sm">Total Rides</span>
          <span className="text-2xl font-bold text-white">12</span>
        </div>
        <div className="stat-card">
          <span className="text-slate-400 text-sm">Active Rides</span>
          <span className="text-2xl font-bold text-white">1</span>
        </div>
        <div className="stat-card">
          <span className="text-slate-400 text-sm">Total Earnings</span>
          <span className="text-2xl font-bold text-emerald-400">₹8,450</span>
        </div>
        <div className="stat-card">
          <span className="text-slate-400 text-sm">Rating</span>
          <span className="text-2xl font-bold text-amber-400">4.9 ★</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Your Recent Rides</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-400 text-sm border-b border-slate-700">
              <tr>
                <th className="pb-4 font-medium">Route</th>
                <th className="pb-4 font-medium">Date & Time</th>
                <th className="pb-4 font-medium">Seats</th>
                <th className="pb-4 font-medium">Fare</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rides.map(ride => (
                <tr key={ride.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-medium text-white">{ride.source} → {ride.destination}</td>
                  <td className="py-4 text-slate-300">{formatDate(ride.date)}</td>
                  <td className="py-4 text-slate-300">{ride.bookedSeats}/{ride.totalSeats}</td>
                  <td className="py-4 text-slate-300">{formatFare(ride.fare)}</td>
                  <td className="py-4"><Badge status={ride.status} /></td>
                  <td className="py-4">
                    <Link to={`/driver/edit-ride/${ride.id}`} className="text-primary-400 hover:text-primary-300 text-sm font-medium mr-4">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
