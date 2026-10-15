import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleRoute from './components/layout/RoleRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import DriverDashboard from './pages/driver/DriverDashboard'
import CreateRide from './pages/driver/CreateRide'
import EditRide from './pages/driver/EditRide'
import BookingRequests from './pages/driver/BookingRequests'
import SearchRides from './pages/passenger/SearchRides'
import RideDetail from './pages/passenger/RideDetail'
import SeatSelection from './pages/passenger/SeatSelection'
import BookingHistory from './pages/passenger/BookingHistory'
import BookingSuccess from './pages/shared/BookingSuccess'
import Chat from './pages/shared/Chat'
import Profile from './pages/shared/Profile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/rides/:id" element={<RideDetail />} />
            <Route path="/booking-success/:id" element={<BookingSuccess />} />
            <Route path="/chat/:rideId" element={<Chat />} />

            {/* Driver Only Routes */}
            <Route element={<RoleRoute role="driver" />}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/create-ride" element={<CreateRide />} />
              <Route path="/driver/edit-ride/:id" element={<EditRide />} />
              <Route path="/driver/bookings" element={<BookingRequests />} />
            </Route>

            {/* Passenger Only Routes */}
            <Route element={<RoleRoute role="passenger" />}>
              <Route path="/search" element={<SearchRides />} />
              <Route path="/rides/:id/select-seats" element={<SeatSelection />} />
              <Route path="/bookings" element={<BookingHistory />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
