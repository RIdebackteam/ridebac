/**
 * Location Autocomplete using Geoapify Places API
 * Drops a dropdown with address suggestions as the user types
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader, X } from 'lucide-react'

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY

export default function LocationAutocomplete({
  label,
  placeholder = 'Search city or address...',
  value,
  onSelect, // (suggestion: { text, lat, lon }) => void
  icon,
  required = false,
}) {
  const [query, setQuery] = useState(value?.text || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Sync query when value is reset from parent
  useEffect(() => {
    if (value?.text && value.text !== query) setQuery(value.text)
  }, [value?.text])

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&filter=countrycode:in&format=json&limit=6&apiKey=${GEOAPIFY_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      setSuggestions(
        (data.results || []).map((r) => ({
          text: r.formatted,
          city: r.city || r.state || r.formatted,
          lat: r.lat,
          lon: r.lon,
        }))
      )
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300)
  }

  const handleSelect = (s) => {
    setQuery(s.text)
    setSuggestions([])
    setOpen(false)
    onSelect(s)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    onSelect(null)
  }

  return (
    <div className="relative space-y-1.5" ref={wrapperRef}>
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : (icon || <MapPin className="w-4 h-4" />)}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="input-field pl-10 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full glass-strong rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50 animate-fade-in">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/60 transition-colors border-b border-slate-700/30 last:border-0 flex items-start gap-3"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium leading-snug truncate">{s.city}</p>
                <p className="text-slate-400 text-xs truncate mt-0.5">{s.text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
