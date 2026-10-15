import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, IndianRupee, Car, Users, FileText, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LocationAutocomplete from '../../components/ui/LocationAutocomplete'
import RideMap from '../../components/rides/RideMap'

const VEHICLE_SEAT_MAP = {
  hatchback: 4,
  sedan: 4,
  suv: 6,
  mpv: 7,
}

const VEHICLE_TYPES = [
  { value: 'hatchback', label: 'Hatchback', icon: '🚗', desc: '4 passengers' },
  { value: 'sedan',     label: 'Sedan',     icon: '🚙', desc: '4 passengers' },
  { value: 'suv',       label: 'SUV',       icon: '🚐', desc: '6 passengers' },
  { value: 'mpv',       label: 'MPV/Van',   icon: '🚌', desc: '7 passengers' },
]

export default function CreateRide() {
  const navigate = useNavigate()
  const [source, setSource] = useState(null)
  const [destination, setDestination] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    fare: '',
    vehicleType: 'sedan',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null) // { distanceKm, durationMin }

  // Derived total seats from vehicle type
  const totalSeats = VEHICLE_SEAT_MAP[formData.vehicleType] || 4
  const set = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!source?.lat || !source?.lon) {
      toast.error('Please select a valid source location from the dropdown')
      return
    }
    if (!destination?.lat || !destination?.lon) {
      toast.error('Please select a valid destination from the dropdown')
      return
    }
    setLoading(true)
    try {
      await api.post('/rides', {
        source: source.city || source.text,
        sourceLat: source.lat,
        sourceLon: source.lon,
        destination: destination.city || destination.text,
        destinationLat: destination.lat,
        destinationLon: destination.lon,
        date: formData.date,
        time: formData.time,
        fare: Number(formData.fare),
        totalSeats,
        notes: formData.notes,
      })
      toast.success('Ride published! 🚗')
      navigate('/driver/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish ride')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Publish a New Ride</h1>
          <p className="text-slate-400">Share your journey and split the costs with verified passengers.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Vehicle Type Selector */}
            <div className="card">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-primary-400" /> Your Vehicle Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, vehicleType: v.value }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.vehicleType === v.value
                        ? 'border-primary-500 bg-primary-900/30 shadow-lg shadow-primary-900/20'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{v.icon}</span>
                    <p className="text-white text-sm font-semibold">{v.label}</p>
                    <p className="text-slate-400 text-xs">{v.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-400 bg-slate-800/40 rounded-lg px-3 py-2">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>This will offer <span className="text-emerald-400 font-semibold">{totalSeats - 1} passenger seats</span> (driver seat excluded)</span>
              </div>
            </div>

            {/* Route */}
            <div className="card space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">A</span>
                Route Details
                <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white ml-auto">B</span>
              </h3>

              <LocationAutocomplete
                label="From (Pickup City)"
                placeholder="e.g. Mumbai, Maharashtra"
                value={source}
                onSelect={setSource}
                required
              />

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-700" />
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <LocationAutocomplete
                label="To (Drop City)"
                placeholder="e.g. Pune, Maharashtra"
                value={destination}
                onSelect={setDestination}
                required
              />
            </div>

            {/* Date / Time / Fare */}
            <div className="card space-y-4">
              <h3 className="text-white font-semibold">Trip Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={set('date')}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Departure Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={set('time')}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Fare per Passenger (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    max="10000"
                    placeholder="500"
                    value={formData.fare}
                    onChange={set('fare')}
                    className="input-field pl-10"
                  />
                </div>
                <p className="text-xs text-slate-500">Set a fair price — passengers compare options</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes for passengers (optional)
                </label>
                <textarea
                  rows={2}
                  className="input-field resize-none"
                  placeholder="e.g. Will stop for chai at highway, no heavy luggage..."
                  value={formData.notes}
                  onChange={set('notes')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>🚗 Publish Ride</>
              )}
            </button>
          </form>

          {/* Live Map Preview */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Route Preview</h3>
              <RideMap source={source} destination={destination} height="h-80" onRouteInfo={setRouteInfo} />
              {source && destination && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300 truncate max-w-[120px]">{source.city || source.text}</span>
                  </div>
                  <div className="text-slate-500">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-300 truncate max-w-[120px]">{destination.city || destination.text}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-white font-semibold mb-3">Ride Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="text-white capitalize">{formData.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats offered</span>
                  <span className="text-emerald-400 font-semibold">{totalSeats - 1}</span>
                </div>
                {formData.fare && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max earnings</span>
                    <span className="text-white font-bold">₹{(formData.fare * (totalSeats - 1)).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {routeInfo?.distanceKm && (
                  <div className="flex justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-slate-400">Distance</span>
                    <span className="text-white font-semibold">{routeInfo.distanceKm} km</span>
                  </div>
                )}
                {routeInfo?.durationMin && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. drive time</span>
                    <span className="text-white font-semibold">
                      {routeInfo.durationMin >= 60
                        ? `${Math.floor(routeInfo.durationMin / 60)}h ${routeInfo.durationMin % 60}m`
                        : `${routeInfo.durationMin} min`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
