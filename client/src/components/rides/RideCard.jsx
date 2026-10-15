import { Link } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Star, Car } from 'lucide-react'
import { formatDate, formatTime, formatFare } from '../../utils/formatters'

const vehicleTypeLabel = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  mpv: 'MPV',
}

function StarRating({ rating }) {
  const avg = rating > 0 ? (rating / 5).toFixed(1) : '—'
  return (
    <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
      <Star className="w-3.5 h-3.5 fill-amber-400" />
      {avg}
    </span>
  )
}

export default function RideCard({ ride }) {
  const driver = ride.driverId
  const driverUser = driver?.userId
  const availableSeats = ride.totalSeats - 1 - (ride.bookedSeats?.length || 0)

  return (
    <div className="card-hover group relative overflow-hidden">
      {/* Top gradient accent line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary-600 via-emerald-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Route Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="w-0.5 h-6 bg-slate-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base truncate">{ride.source}</p>
              <p className="text-slate-400 text-sm truncate mt-2">{ride.destination}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-400" />
              {formatDate(ride.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-400" />
              {formatTime(ride.time)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{availableSeats}</span> seats left
            </span>
            {driver?.vehicleType && (
              <span className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                {vehicleTypeLabel[driver.vehicleType] || driver.vehicleType}
              </span>
            )}
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
          <div className="flex items-center gap-2 sm:flex-col sm:items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-primary-500/20">
              {driverUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="sm:text-center">
              <p className="text-white text-sm font-medium leading-tight">{driverUser?.name || 'Driver'}</p>
              <StarRating rating={driver?.rating || 0} />
            </div>
          </div>
        </div>

        {/* Fare + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-3 sm:ml-4 sm:pl-4 sm:border-l sm:border-slate-700">
          <div className="text-right">
            <p className="text-2xl font-black text-white">{formatFare(ride.fare)}</p>
            <p className="text-xs text-slate-400">per seat</p>
          </div>
          <Link
            to={`/rides/${ride._id}`}
            className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap flex-shrink-0"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
