import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Phone, MessageSquare, MapPin, Calendar, Clock, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatDate, formatTime, formatFare } from '../../utils/formatters'

export default function BookingSuccess() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get('/bookings/my')
        const found = res.data.data.bookings.find((b) => b._id === id)
        setBooking(found || null)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id])

  const copyRef = () => {
    navigator.clipboard.writeText(id)
    toast.success('Booking ID copied!')
  }

  const ride = booking?.rideId
  const driver = ride?.driverId
  const driverUser = driver?.userId

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 bg-mesh flex items-start justify-center">
      <div className="max-w-lg w-full animate-slide-up">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-pulse-slow">
              <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
              ✓
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-400">Your ride has been successfully booked. Have a great journey! 🚗</p>
        </div>

        {/* Booking ID */}
        <div className="glass p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">Booking Reference</p>
            <p className="text-white font-mono text-sm">{id}</p>
          </div>
          <button onClick={copyRef} className="btn-ghost p-2">
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Ride Details */}
        {ride && (
          <div className="glass p-5 mb-4">
            <h3 className="text-white font-semibold mb-4">Ride Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="w-0.5 h-5 bg-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{ride.source}</p>
                  <p className="text-slate-400 text-sm mt-1">{ride.destination}</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm pt-2 border-t border-slate-700/50">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-primary-400" />
                  {formatDate(ride.date)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-primary-400" />
                  {formatTime(ride.time)}
                </span>
                <span className="text-emerald-400 font-bold ml-auto">{formatFare(booking.fare)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Driver Contact — REVEALED */}
        <div className="glass p-5 mb-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <h3 className="text-emerald-400 font-semibold text-sm">Driver Contact Revealed</h3>
          </div>

          {driverUser ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {driverUser.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{driverUser.name}</p>
                <p className="text-slate-300 text-sm flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {driverUser.phone || 'Available in app'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Driver details will be available shortly.</p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            to={ride ? `/chat/${ride._id}` : '/bookings'}
            className="btn-primary flex items-center justify-center gap-2 py-3"
          >
            <MessageSquare className="w-4 h-4" /> Chat Driver
          </Link>
          <Link to="/bookings" className="btn-secondary flex items-center justify-center gap-2 py-3">
            My Bookings
          </Link>
        </div>
        <Link to="/search" className="block text-center text-slate-400 hover:text-white transition-colors text-sm">
          ← Search more rides
        </Link>
      </div>
    </div>
  )
}
