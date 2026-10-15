import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, MessageSquare, Star, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatDate, formatTime, formatFare, statusColors } from '../../utils/formatters'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

function StatusBadge({ status }) {
  const cls = statusColors[status] || 'badge-slate'
  return <span className={`badge ${cls} capitalize`}>{status}</span>
}

function RatingModal({ open, onSubmit, onClose }) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-strong p-6 rounded-2xl w-full max-w-sm animate-slide-up">
        <h3 className="text-white font-bold text-lg mb-4">Rate your driver</h3>
        <div className="flex gap-2 justify-center mb-4">
          {[1,2,3,4,5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className="text-3xl transition-transform hover:scale-110">
              {s <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="input-field resize-none mb-4"
          rows={3}
          placeholder="Share your experience (optional)..."
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Skip</button>
          <button onClick={() => onSubmit(rating, review)} className="btn-primary flex-1">Submit</button>
        </div>
      </div>
    </div>
  )
}

function CancelModal({ open, onConfirm, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-strong p-6 rounded-2xl w-full max-w-sm text-center animate-slide-up">
        <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="text-white font-bold text-lg mb-2">Cancel Booking?</h3>
        <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary px-6">Keep it</button>
          <button onClick={onConfirm} className="btn-danger px-6">Cancel Booking</button>
        </div>
      </div>
    </div>
  )
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [ratingModal, setRatingModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/bookings/my')
      setBookings(res.data.data.bookings)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await api.patch(`/bookings/${cancelModal}/cancel`)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelModal(null)
    }
  }

  const handleRate = async (rating, review) => {
    try {
      await api.patch(`/bookings/${ratingModal}/rate`, { rating, review })
      toast.success('Rating submitted! Thank you 🌟')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit rating')
    } finally {
      setRatingModal(null)
    }
  }

  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true
    return b.bookingStatus?.toLowerCase() === activeTab.toLowerCase()
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
        <p className="text-slate-400 mb-8">View and manage all your ride bookings</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto bg-slate-800/50 p-1 rounded-xl w-fit max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">🎫</p>
            <p className="text-white font-semibold text-lg">No {activeTab.toLowerCase()} bookings</p>
            <p className="text-slate-400 text-sm mt-2 mb-6">Your ride bookings will appear here</p>
            <Link to="/search" className="btn-primary inline-flex">Find a Ride</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const ride = booking.rideId
              const driver = ride?.driverId
              const driverUser = driver?.userId
              return (
                <div key={booking._id} className="glass p-5 animate-fade-in">
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Route */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={booking.bookingStatus} />
                        <span className="text-xs text-slate-500">Seat #{booking.seatIndex}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white font-semibold truncate">
                          {ride?.source} → {ride?.destination}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-400">
                        {ride?.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(ride.date)}
                          </span>
                        )}
                        {ride?.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {formatTime(ride.time)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fare + Driver */}
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-lg">{formatFare(booking.fare)}</p>
                      <p className="text-slate-400 text-xs mt-1">{driverUser?.name || 'Driver'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    {booking.bookingStatus === 'confirmed' && (
                      <Link
                        to={`/chat/${ride?._id}`}
                        className="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Chat Driver
                      </Link>
                    )}
                    {booking.bookingStatus === 'completed' && !booking.rating && (
                      <button
                        onClick={() => setRatingModal(booking._id)}
                        className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        <Star className="w-4 h-4" /> Rate Driver
                      </button>
                    )}
                    {booking.bookingStatus === 'completed' && booking.rating && (
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        {'⭐'.repeat(booking.rating)} Rated
                      </span>
                    )}
                    {['pending', 'confirmed'].includes(booking.bookingStatus) && (
                      <button
                        onClick={() => setCancelModal(booking._id)}
                        className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors ml-auto"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    <Link
                      to={`/rides/${ride?._id}`}
                      className="text-sm text-slate-400 hover:text-white transition-colors ml-auto"
                    >
                      View Ride →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RatingModal
        open={!!ratingModal}
        onSubmit={handleRate}
        onClose={() => setRatingModal(null)}
      />
      <CancelModal
        open={!!cancelModal}
        onConfirm={handleCancel}
        onClose={() => setCancelModal(null)}
      />
    </div>
  )
}
