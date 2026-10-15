import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, User, Mail, Lock, Phone } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'passenger'
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register(formData)
      // devOtp is returned in development mode — pass it to verify screen
      navigate('/verify-otp', { state: { email: formData.email, devOtp: res?.data?.devOtp } })
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-slate-900 border-r border-slate-800 p-12 items-center justify-center relative overflow-hidden bg-mesh">
        <div className="max-w-md relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-white">RideBack</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-6">Join the community</h1>
          <p className="text-lg text-slate-400 mb-8">Create an account to start sharing rides, saving money, and protecting the environment.</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center text-primary-400"><User className="w-5 h-5"/></div>
              <span>Verified member profiles</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400"><Car className="w-5 h-5"/></div>
              <span>Save up to 70% on travel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Create an account</h2>
            <p className="mt-2 text-slate-400">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Log in</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'passenger'})}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'passenger' ? 'border-primary-500 bg-primary-900/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Passenger</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'driver'})}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'driver' ? 'border-primary-500 bg-primary-900/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
              >
                <Car className="w-6 h-6" />
                <span className="font-medium">Driver</span>
              </button>
            </div>

            <Input 
              label="Full Name"
              icon={<User className="w-5 h-5" />}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Email Address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input 
              label="Phone Number"
              icon={<Phone className="w-5 h-5" />}
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Input 
              label="Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
