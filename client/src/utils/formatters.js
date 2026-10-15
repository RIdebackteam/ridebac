import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy')
export const formatTime = (time) => {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}
export const formatFare = (amount) => `₹${amount.toLocaleString('en-IN')}`
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })
export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a')

export const statusColors = {
  pending: 'badge-amber',
  confirmed: 'badge-emerald',
  cancelled: 'badge-rose',
  rejected: 'badge-rose',
  completed: 'badge-primary',
  scheduled: 'badge-emerald',
  ongoing: 'badge-amber',
}

export const vehicleTypeLabel = {
  hatchback: '🚗 Hatchback (4 seats)',
  sedan: '🚙 Sedan (4 seats)',
  suv: '🚐 SUV (6 seats)',
  mpv: '🚌 MPV (7 seats)',
}
