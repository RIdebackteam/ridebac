import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Car, Menu, X, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  
  const { user, logout, isDriver, isPassenger } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = []
  if (isDriver) {
    navLinks.push(
      { name: 'Dashboard', path: '/driver/dashboard' },
      { name: 'Publish Ride', path: '/driver/create-ride' },
      { name: 'Bookings', path: '/driver/bookings' }
    )
  } else if (isPassenger) {
    navLinks.push(
      { name: 'Find Rides', path: '/search' },
      { name: 'My Bookings', path: '/bookings' }
    )
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-strong py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">RideBack</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden py-1 border border-slate-700 shadow-xl">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                      Profile Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary py-2 px-5">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-strong border-t border-slate-700 p-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="block px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-px bg-slate-700 my-2"></div>
            
            {user ? (
              <>
                <Link to="/profile" className="block px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200">
                  Profile Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 text-rose-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" className="btn-secondary w-full text-center">Log in</Link>
                <Link to="/register" className="btn-primary w-full text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
