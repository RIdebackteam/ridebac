/**
 * RideMap — MapTiler tiles + Leaflet rendering + real route polyline
 *
 * Props:
 *  - source:       { text, lat, lon }
 *  - destination:  { text, lat, lon }
 *  - height:       string (default "h-72")
 *  - onRouteInfo:  ({ distanceKm, durationMin }) => void  (optional)
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MAPTILER_KEY    = import.meta.env.VITE_MAPTILER_KEY
const ROUTING_TOKEN   = import.meta.env.VITE_MAPTILER_ROUTING_TOKEN
const GEOAPIFY_KEY    = import.meta.env.VITE_GEOAPIFY_KEY

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

/**
 * Returns { coords: [[lat,lon]...], distanceKm, durationMin }
 * Tries MapTiler Directions v2 (JWT token) first,
 * then Geoapify routing as fallback,
 * then a straight-line last resort.
 */
async function fetchRoute(srcLat, srcLon, dstLat, dstLon) {
  // ── 1. MapTiler Directions v2 (uses JWT ROUTING_TOKEN) ──────────────────
  try {
    const url =
      `https://api.maptiler.com/directions/v2/route/driving` +
      `/${srcLon},${srcLat};${dstLon},${dstLat}` +
      `?key=${MAPTILER_KEY}&geometries=geojson`
    const headers = ROUTING_TOKEN
      ? { Authorization: `Bearer ${ROUTING_TOKEN}` }
      : {}
    const res  = await fetch(url, { headers })
    const json = await res.json()
    const route = json.routes?.[0]
    if (route?.geometry?.coordinates) {
      return {
        coords:      route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceKm:  route.distance ? +(route.distance / 1000).toFixed(1) : null,
        durationMin: route.duration ? Math.round(route.duration / 60) : null,
      }
    }
  } catch { /* fall through */ }

  // ── 2. Geoapify Routing fallback ─────────────────────────────────────────
  try {
    const url =
      `https://api.geoapify.com/v1/routing` +
      `?waypoints=${srcLat},${srcLon}|${dstLat},${dstLon}` +
      `&mode=drive&details=instruction_details&apiKey=${GEOAPIFY_KEY}`
    const res  = await fetch(url)
    const json = await res.json()
    const feat = json.features?.[0]
    if (feat) {
      const rawCoords = feat.geometry?.coordinates
      // Geoapify returns MultiLineString for long routes
      const coordArr = Array.isArray(rawCoords?.[0]?.[0])
        ? rawCoords.flat()
        : rawCoords?.[0] || []
      if (coordArr.length) {
        return {
          coords:      coordArr.map(([lng, lat]) => [lat, lng]),
          distanceKm:  feat.properties?.distance != null
            ? +(feat.properties.distance / 1000).toFixed(1)
            : null,
          durationMin: feat.properties?.time != null
            ? Math.round(feat.properties.time / 60)
            : null,
        }
      }
    }
  } catch { /* fall through */ }

  // ── 3. Straight-line last resort ─────────────────────────────────────────
  return {
    coords:      [[srcLat, srcLon], [dstLat, dstLon]],
    distanceKm:  null,
    durationMin: null,
  }
}

export default function RideMap({ source, destination, height = 'h-72', onRouteInfo }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const routeLayerRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current) return

    // Init map once
    if (!instanceRef.current) {
      instanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      // MapTiler Streets tile layer (dark style)
      L.tileLayer(
        `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          maxZoom: 18,
          attribution:
            '© <a href="https://www.maptiler.com">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          crossOrigin: true,
        }
      ).addTo(instanceRef.current)

      // Default view — center of India
      instanceRef.current.setView([20.5937, 78.9629], 5)
    }

    const map = instanceRef.current

    // Clear previous markers and route
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    const srcValid = source?.lat && source?.lon
    const dstValid = destination?.lat && destination?.lon

    if (srcValid) {
      const m = L.marker([source.lat, source.lon], { icon: makeIcon('#10b981') })
        .addTo(map)
        .bindPopup(`<b>From:</b> ${source.city || source.text}`)
      markersRef.current.push(m)
    }

    if (dstValid) {
      const m = L.marker([destination.lat, destination.lon], { icon: makeIcon('#f43f5e') })
        .addTo(map)
        .bindPopup(`<b>To:</b> ${destination.city || destination.text}`)
      markersRef.current.push(m)
    }

    if (srcValid && dstValid) {
      // Draw route
      fetchRoute(source.lat, source.lon, destination.lat, destination.lon).then(({ coords, distanceKm, durationMin }) => {
        routeLayerRef.current = L.polyline(coords, {
          color: '#6366f1',
          weight: 4,
          opacity: 0.85,
          smoothFactor: 1,
          dashArray: null,
        }).addTo(map)

        // Add animated dot effect via a second thinner polyline
        L.polyline(coords, {
          color: '#818cf8',
          weight: 2,
          opacity: 0.5,
          dashArray: '8 6',
        }).addTo(map)

        const bounds = L.latLngBounds(coords)
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })

        // Surface distance/duration to parent if requested
        if (onRouteInfo && (distanceKm || durationMin)) {
          onRouteInfo({ distanceKm, durationMin })
        }
      })
    } else if (srcValid) {
      map.setView([source.lat, source.lon], 10)
    } else if (dstValid) {
      map.setView([destination.lat, destination.lon], 10)
    }

    return () => {
      // Don't destroy the map on re-render — just clear markers/routes above
    }
  }, [source?.lat, source?.lon, destination?.lat, destination?.lon])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={`${height} w-full rounded-xl overflow-hidden border border-slate-700/50 relative`}>
      <div ref={mapRef} className="h-full w-full" />
      {(!source?.lat && !destination?.lat) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-slate-400 text-sm">Enter source and destination to see the route</p>
          </div>
        </div>
      )}
    </div>
  )
}
