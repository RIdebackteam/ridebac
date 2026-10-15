import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('rideback_user')
    const storedToken = localStorage.getItem('rideback_token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { user: userData, token: accessToken, needsVerification, devOtp } = res.data.data

      setUser(userData)
      setToken(accessToken)
      localStorage.setItem('rideback_user', JSON.stringify(userData))
      localStorage.setItem('rideback_token', accessToken)

      if (needsVerification) {
        toast('Please verify your account first.', { icon: '⚠️' })
        return { needsVerification: true, email, devOtp }
      }

      return userData
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data)
      // Only store the token so the OTP verify call works (it's a protected route)
      // DO NOT store user in state yet — user must verify OTP first
      const { token: accessToken } = res.data.data
      setToken(accessToken)
      localStorage.setItem('rideback_token', accessToken)
      // Do NOT call setUser() here — navbar won't show them as logged in
      return res.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('rideback_user')
    localStorage.removeItem('rideback_token')
  }

  const updateUser = (data) => {
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    localStorage.setItem('rideback_user', JSON.stringify(updatedUser))
  }

  // Called after OTP verification succeeds — fully activates the session
  const activateUser = (userData, accessToken) => {
    if (accessToken) {
      setToken(accessToken)
      localStorage.setItem('rideback_token', accessToken)
    }
    setUser(userData)
    localStorage.setItem('rideback_user', JSON.stringify(userData))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    activateUser,
    isDriver: user?.role === 'driver',
    isPassenger: user?.role === 'passenger',
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
