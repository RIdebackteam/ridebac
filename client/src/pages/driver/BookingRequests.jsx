import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Car, MapPin, Clock, Calendar, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatDate, formatTime, formatFare, statusColors } from '../../utils/formatters'

const tabs = ['All', 'Pending', 'Confirmed', 'Rejected']

function ConfirmModal({ open, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-strong p-6 rounded-2xl w-full max-w-sm text-center animate-slide-up">
        <p className="text-white text-lg font-semibold mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger px-5 py-2.5 text-sm' : 'btn-emerald px-5 py-2.5 text-sm'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cls = statusColors[status] || 'badge-slate'
  return <span className={`badge ${cls} capitalize`}>{status}</span>
}

export default function BookingRequests() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [actionLoading, setActionLoading] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'accept'|'reject', bookingId, name }

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/driver/bookings')
      setBookings(res.data.data.bookings)
    } catch {
      toast.error('Failed to load booking requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (bookingId) => {
    setActionLoading(bookingId + '-accept')
    try {
      await api.patch(`/bookings/${bookingId}/accept`)
      toast.success('Booking accepted ✅')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to accept booking')
    } finally {
      setActionLoading(null)
      setModal(null)
    }
  }

  const handleReject = async (bookingId) => {
    setActionLoading(bookingId + '-reject')
    try {
      await api.patch(`/bookings/${bookingId}/reject`)
      toast.success('Booking rejected')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject booking')
    } finally {
      setActionLoading(null)
      setModal(null)
    }
  }

  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true
    return b.bookingStatus?.toLowerCase() === activeTab.toLowerCase()
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading booking requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Booking Requests</h1>
          <p className="text-slate-400">Review and manage passenger booking requests for your rides</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-70">
                ({bookings.filter((b) => tab === 'All' || b.bookingStatus?.toLowerCase() === tab.toLowerCase()).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-white font-semibold text-lg">No {activeTab.toLowerCase()} requests</p>
            <p className="text-slate-400 text-sm mt-2">Booking requests will appear here when passengers book your rides</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking._id} className="glass p-5 animate-fade-in">
                {/* Ride Info header */}
                <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span className="text-white font-semibold">
                    {booking.rideId?.source} → {booking.rideId?.destination}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 text-sm ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.rideId?.date)}
                    <Clock className="w-3.5 h-3.5 ml-1" />
                    {formatTime(booking.rideId?.time)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Passenger Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {booking.passengerId?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{booking.passengerId?.name}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.passengerId?.phone || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Seat + Fare */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Seat</p>
                      <p className="text-white font-semibold">#{booking.seatIndex}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Fare</p>
                      <p className="text-emerald-400 font-bold">{formatFare(booking.fare)}</p>
                    </div>
                    <StatusBadge status={booking.bookingStatus} />
                  </div>

                  {/* Actions (only for pending) */}
                  {booking.bookingStatus === 'pending' && (
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => setModal({ type: 'accept', bookingId: booking._id, name: booking.passengerId?.name })}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => setModal({ type: 'reject', bookingId: booking._id, name: booking.passengerId?.name })}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!modal}
        message={
          modal?.type === 'accept'
            ? `Accept booking from ${modal?.name}?`
            : `Reject booking from ${modal?.name}? This cannot be undone.`
        }
        confirmLabel={modal?.type === 'accept' ? 'Accept' : 'Reject'}
        danger={modal?.type === 'reject'}
        onConfirm={() =>
          modal?.type === 'accept' ? handleAccept(modal.bookingId) : handleReject(modal.bookingId)
        }
        onCancel={() => setModal(null)}
      />
    </div>
  )
}
