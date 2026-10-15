import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const location = useLocation()
  const navigate = useNavigate()
  const { updateUser, activateUser } = useAuth()

  const email = location.state?.email
  const devOtp = location.state?.devOtp

  // Auto-fill OTP in dev mode
  useEffect(() => {
    if (devOtp && devOtp.length === 6) {
      setOtp(devOtp.split(''))
    }
  }, [devOtp])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register')
  }, [email, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, '') // digits only
    if (!value && e.nativeEvent.inputType !== 'deleteContentBackward') return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      document.getElementById('otp-5')?.focus()
    }
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpValue })
      const { user, token } = res.data.data
      // Fully activate the session — sets user in state with isVerified: true
      activateUser(user, token)
      toast.success('Account verified! Welcome to RideBack 🚗')
      navigate(user?.role === 'driver' ? '/driver/dashboard' : '/search')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('OTP resent! Check your phone.')
      setCountdown(60)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) return null

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-mesh">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary-500/30">
            <span className="text-4xl">📱</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Verify your account</h2>
          <p className="text-slate-400 mb-6 text-sm">
            We've sent a 6-digit code to{' '}
            <span className="text-primary-400 font-medium">{email}</span>
          </p>

          {/* Dev mode OTP banner */}
          {devOtp && (
            <div className="mb-6 p-3 bg-amber-900/30 border border-amber-600/40 rounded-xl text-left">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">🔧 Dev Mode — Your OTP</p>
              <p className="text-amber-300 text-2xl font-black tracking-[0.3em]">{devOtp}</p>
              <p className="text-amber-600 text-xs mt-1">Auto-filled above. This won't show in production.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold bg-slate-800 border-2 rounded-xl text-white focus:outline-none transition-all duration-150"
                  style={{
                    borderColor: digit ? 'rgb(99, 102, 241)' : 'rgb(71, 85, 105)',
                    boxShadow: digit ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                  maxLength={1}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Account'
              )}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-6 text-sm text-slate-400">
            {countdown > 0 ? (
              <p>
                Resend code in{' '}
                <span className="text-primary-400 font-semibold tabular-nums">{String(countdown).padStart(2, '0')}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : "Didn't receive it? Resend OTP"}
              </button>
            )}
          </div>

          <div className="divider" />

          <a href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Back to Register
          </a>
        </div>
      </div>
    </div>
  )
}
