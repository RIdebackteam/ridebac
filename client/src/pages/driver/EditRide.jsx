import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Calendar, Clock, IndianRupee, ArrowLeft, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function EditRide() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    source: '', destination: '', date: '', time: '', fare: '', notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/${id}`)
        const r = res.data.data.ride
        setFormData({
          source: r.source || '',
          destination: r.destination || '',
          date: r.date ? r.date.split('T')[0] : '',
          time: r.time || '',
          fare: r.fare || '',
          notes: r.notes || '',
        })
      } catch {
        toast.error('Failed to load ride details')
        navigate('/driver/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchRide()
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/rides/${id}`, formData)
      toast.success('Ride updated successfully!')
      navigate('/driver/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ride')
    } finally {
      setSaving(false)
    }
  }

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading ride details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Edit Ride</h1>
        <p className="text-slate-400 mb-8">Update the details of your published ride. Note: rides with confirmed bookings cannot be edited.</p>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Source City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="text" required value={formData.source} onChange={set('source')}
                  className="input-field pl-10" placeholder="e.g. Mumbai" />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Destination City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="text" required value={formData.destination} onChange={set('destination')}
                  className="input-field pl-10" placeholder="e.g. Pune" />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="date" required value={formData.date} onChange={set('date')}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field pl-10" />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Departure Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="time" required value={formData.time} onChange={set('time')}
                  className="input-field pl-10" />
              </div>
            </div>

            {/* Fare */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Fare per Seat (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="number" required min="0" value={formData.fare} onChange={set('fare')}
                  className="input-field pl-10" placeholder="500" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Notes (optional)</label>
            <textarea value={formData.notes} onChange={set('notes')} rows={3}
              className="input-field resize-none" placeholder="Any special instructions for passengers..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
