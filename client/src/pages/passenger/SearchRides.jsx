import { useState, useEffect, useCallback, useRef } from 'react'
import { Filter, SlidersHorizontal, X, Calendar, IndianRupee, Users, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LocationAutocomplete from '../../components/ui/LocationAutocomplete'
import RideCard from '../../components/rides/RideCard'
import RideMap from '../../components/rides/RideMap'

function FilterPanel({ filters, onChange, onClear, show }) {
  return (
    <div className={`${show ? 'block' : 'hidden'} lg:block`}>
      <div className="card sticky top-28 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-400" /> Filters
          </h3>
          {(filters.maxFare || filters.minSeats > 1) && (
            <button onClick={onClear} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Max Fare (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min="0"
              placeholder="No limit"
              value={filters.maxFare}
              onChange={(e) => onChange('maxFare', e.target.value)}
              className="input-field pl-9 text-sm py-2.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Min Seats Available</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange('minSeats', n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.minSeats === n
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                {n}+
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Vehicle Type</label>
          <select
            value={filters.vehicleType}
            onChange={(e) => onChange('vehicleType', e.target.value)}
            className="input-field text-sm py-2.5"
          >
            <option value="">All Vehicles</option>
            <option value="hatchback">Hatchback</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="mpv">MPV / Van</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function SearchRides() {
  const [source, setSource] = useState(null)
  const [destination, setDestination] = useState(null)
  const [date, setDate] = useState('')
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [filters, setFilters] = useState({ maxFare: '', minSeats: 1, vehicleType: '' })

  const handleSearch = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (source?.city) params.set('source', source.city)
      if (destination?.city) params.set('destination', destination.city)
      if (date) params.set('date', date)
      if (filters.maxFare) params.set('maxFare', filters.maxFare)
      if (filters.minSeats > 1) params.set('minSeats', filters.minSeats)
      if (filters.vehicleType) params.set('vehicleType', filters.vehicleType)

      const res = await api.get(`/rides?${params}`)
      setRides(res.data.data.rides || [])
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const changeFilter = (key, val) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
  }

  const clearFilters = () => setFilters({ maxFare: '', minSeats: 1, vehicleType: '' })

  // Also re-fetch when filters change if a search was already done
  useEffect(() => {
    if (searched) handleSearch()
  }, [filters])

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Find a Ride</h1>
          <p className="text-slate-400">Search for available carpools across India</p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="glass p-3 rounded-2xl mb-6 shadow-xl shadow-primary-900/10"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <LocationAutocomplete
                placeholder="From — e.g. Mumbai"
                value={source}
                onSelect={setSource}
              />
            </div>
            <div className="flex-1">
              <LocationAutocomplete
                placeholder="To — e.g. Pune"
                value={destination}
                onSelect={setDestination}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field pl-10 h-full"
              />
            </div>
            <button type="submit" className="btn-primary px-8 whitespace-nowrap">
              Search Rides
            </button>
          </div>
        </form>

        {/* Toolbar row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              showFilters
                ? 'bg-primary-600 text-white border-primary-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              showMap
                ? 'bg-emerald-700 text-white border-emerald-600'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            🗺️ {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          {searched && !loading && (
            <p className="text-slate-400 text-sm ml-auto">
              <span className="text-white font-semibold">{rides.length}</span> ride{rides.length !== 1 && 's'} found
            </p>
          )}
        </div>

        {/* Map Banner */}
        {showMap && (source || destination) && (
          <div className="mb-6 animate-slide-up">
            <RideMap source={source} destination={destination} height="h-64" />
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Filters sidebar */}
          <div className="w-64 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onChange={changeFilter}
              onClear={clearFilters}
              show={showFilters}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass p-6 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {!loading && searched && rides.length === 0 && (
              <div className="card text-center py-16">
                <p className="text-5xl mb-4">🚗</p>
                <p className="text-white font-semibold text-xl mb-2">No rides found</p>
                <p className="text-slate-400">
                  Try different dates, cities, or remove some filters.
                </p>
              </div>
            )}

            {!loading && !searched && (
              <div className="card text-center py-16 border-dashed border-slate-600">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-white font-semibold text-lg mb-2">Search for rides above</p>
                <p className="text-slate-400 text-sm">Enter your source, destination, and travel date</p>
              </div>
            )}

            {!loading && rides.map((ride) => (
              <div key={ride._id} className="animate-fade-in">
                <RideCard ride={ride} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
