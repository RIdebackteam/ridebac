import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Car } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await login(formData.email, formData.password)
      if (result?.needsVerification) {
        // Not verified yet — redirect to OTP page with auto-fill
        navigate('/verify-otp', { state: { email: result.email, devOtp: result.devOtp } })
        return
      }
      navigate(result.role === 'driver' ? '/driver/dashboard' : '/search')
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 flex">
      <div className="hidden lg:flex flex-1 bg-slate-900 border-r border-slate-800 items-center justify-center relative bg-mesh">
        <div className="text-center relative z-10 max-w-md px-4">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-600/30">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-slate-400 text-lg">Log in to check your bookings, message your driver, or publish a new ride.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-white">Log in</h2>
            <p className="mt-2 text-slate-400">Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email Address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <div>
              <Input 
                label="Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 font-medium">Forgot password?</Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Log In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
