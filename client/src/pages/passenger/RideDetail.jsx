import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Star, Car, Phone, Shield, ArrowLeft, MessageSquare, Route, Timer } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime, formatFare } from '../../utils/formatters'
import RideMap from '../../components/rides/RideMap'

function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
      ))}
      <span className="text-amber-400 text-sm ml-1 font-medium">{value > 0 ? value : 'New'}</span>
    </div>
  )
}

export default function RideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [contactRevealed, setContactRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [routeInfo, setRouteInfo] = useState(null)

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/${id}`)
        setRide(res.data.data.ride)
        setContactRevealed(res.data.data.contactRevealed)
      } catch {
        toast.error('Ride not found')
        navigate('/search')
      } finally {
        setLoading(false)
      }
    }
    fetchRide()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading ride details...</p>
        </div>
      </div>
    )
  }

  if (!ride) return null

  const driver = ride.driverId
  const driverUser = driver?.userId
  const availableSeats = ride.totalSeats - 1 - (ride.bookedSeats?.length || 0)
  const avgRating = driver?.totalRatings > 0 ? (driver.rating / driver.totalRatings).toFixed(1) : 0

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="card">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 to-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-1">FROM</p>
                    <p className="text-xl font-bold text-white">{ride.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">TO</p>
                    <p className="text-xl font-bold text-white">{ride.destination}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                  <p className="text-white font-semibold text-sm">{formatDate(ride.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
                  <p className="text-white font-semibold text-sm">{formatTime(ride.time)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Seats Left</p>
                  <p className="text-emerald-400 font-bold text-sm">{availableSeats} available</p>
                </div>
              </div>

              {ride.notes && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                  <p className="text-xs text-slate-400 mb-1">Driver's Notes</p>
                  <p className="text-slate-300 text-sm">{ride.notes}</p>
                </div>
              )}

              {/* Live Route Map */}
              {ride.sourceLat && ride.destinationLat && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Route Preview</p>
                  <RideMap
                    source={{ lat: ride.sourceLat, lon: ride.sourceLon, text: ride.source }}
                    destination={{ lat: ride.destinationLat, lon: ride.destinationLon, text: ride.destination }}
                    height="h-56"
                    onRouteInfo={setRouteInfo}
                  />
                  {routeInfo && (
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      {routeInfo.distanceKm && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Route className="w-3.5 h-3.5 text-primary-400" />
                          <span className="font-semibold">{routeInfo.distanceKm} km</span>
                        </div>
                      )}
                      {routeInfo.durationMin && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Timer className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold">
                            {routeInfo.durationMin >= 60
                              ? `${Math.floor(routeInfo.durationMin / 60)}h ${routeInfo.durationMin % 60}m drive`
                              : `${routeInfo.durationMin} min drive`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Driver Card */}
            <div className="card">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-400" /> Driver Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {driverUser?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{driverUser?.name || 'Driver'}</p>
                  <StarDisplay value={parseFloat(avgRating)} />
                  <p className="text-slate-400 text-xs mt-1">{driver?.totalRides || 0} rides completed</p>

                  {/* Vehicle Info */}
                  {driver?.vehicleName && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                      <Car className="w-4 h-4 text-slate-400" />
                      {driver.vehicleName} · {driver.vehicleNumber}
                    </div>
                  )}

                  {/* Phone — masked or revealed */}
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact
                    </p>
                    {contactRevealed ? (
                      <div className="space-y-1">
                        <p className="text-white font-semibold">{driverUser?.phone}</p>
                        <Link to={`/chat/${ride._id}`} className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-500 font-mono text-lg tracking-widest">●●●●●●●●●●</p>
                        <p className="text-xs text-slate-500 mt-1">Available after booking confirmation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-4">
            <div className="card sticky top-28">
              <div className="text-center mb-6">
                <p className="text-4xl font-black text-white">{formatFare(ride.fare)}</p>
                <p className="text-slate-400 text-sm">per seat</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Available seats</span>
                  <span className={`font-semibold ${availableSeats > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {availableSeats > 0 ? `${availableSeats} left` : 'Fully Booked'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="text-white capitalize">{driver?.vehicleType || '—'}</span>
                </div>
              </div>

              {availableSeats > 0 && user?.role === 'passenger' && (
                <Link
                  to={`/rides/${ride._id}/select-seats`}
                  className="btn-primary w-full text-center block"
                >
                  Select Seat & Book
                </Link>
              )}

              {user?.role === 'driver' && (
                <p className="text-center text-slate-400 text-sm">Switch to a passenger account to book rides.</p>
              )}

              {availableSeats === 0 && (
                <div className="text-center p-3 bg-rose-900/20 rounded-xl border border-rose-700/30">
                  <p className="text-rose-400 font-semibold text-sm">Fully Booked</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Driver contact revealed only after booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
