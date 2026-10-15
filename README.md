# RideBack 🚗

**India's trusted peer-to-peer carpooling platform**

> *Travel Together. Save Together.*

---

## Project Structure

```
Ride Back/
├── server/          # Node.js + Express + MongoDB backend
└── client/          # React + Vite + Tailwind frontend
```

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

---

## Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS |

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/verify-otp` | No | Verify OTP |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/driver/profile` | Driver | Create/update vehicle |
| GET | `/api/driver/dashboard` | Driver | Dashboard stats |
| GET | `/api/rides` | No | Search rides |
| GET | `/api/rides/:id` | Optional | Ride detail (privacy-aware) |
| POST | `/api/rides` | Driver | Create ride |
| POST | `/api/bookings` | Passenger | Book ride |
| PATCH | `/api/bookings/:id/pay` | Passenger | Confirm + simulate payment |
| GET | `/api/messages/:rideId` | JWT | Chat history |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, Leaflet (maps), Socket.IO client
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO
- **Database**: MongoDB (Atlas-ready)
- **Auth**: JWT + bcryptjs
- **Maps**: OpenStreetMap + Leaflet + Nominatim (free, no API key)
- **Payments**: Simulated (swap with Razorpay in production)

---

## Key Features

- 🔒 **Driver Privacy**: Phone number hidden until booking confirmed
- 💺 **Interactive Seat Picker**: Visual seat grid (4/6/7-seater support)
- 💬 **Real-time Chat**: Socket.IO powered, post-booking only
- 📱 **Responsive**: Mobile-first design
- 🗺️ **Maps**: Route visualization with Leaflet
- 🔐 **OTP Verification**: Mock OTP flow (logs to console in dev)

---

## Development Notes

- OTP codes are **printed to the server console** in development mode
- Payment is **fully simulated** — no real charges
- Default `.env` uses local MongoDB (`mongodb://localhost:27017/rideback`)
- Uploads stored in `server/uploads/` (swap to Cloudinary in production)
