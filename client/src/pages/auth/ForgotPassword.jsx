import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // ─── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent! Check your email inbox 📧')
      setStep(2)
      startCountdown()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // ─── Countdown timer for resend ───────────────────────────────────────────────
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP resent!')
      startCountdown()
    } catch (err) {
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // ─── OTP input handlers ───────────────────────────────────────────────────────
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, '')
    if (!value && e.nativeEvent.inputType !== 'deleteContentBackward') return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`fp-otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      document.getElementById('fp-otp-5')?.focus()
    }
    e.preventDefault()
  }

  // ─── Step 2: Reset Password ───────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length !== 6) return toast.error('Please enter all 6 OTP digits')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otpValue,
        newPassword,
      })
      toast.success('Password reset successfully! Please log in 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-mesh">
      <div className="w-full max-w-md animate-slide-up">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= s
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`w-12 h-0.5 transition-all duration-500 ${step > s ? 'bg-primary-600' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass p-8">

          {/* ── STEP 1: Enter Email ── */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                  <Mail className="w-7 h-7 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-slate-400 text-sm">Enter your registered email and we'll send you a reset code.</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: Enter OTP + New Password ── */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/30">
                  <KeyRound className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 text-sm">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-primary-400 font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* OTP Boxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 text-center">Verification Code</label>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`fp-otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-11 h-14 text-center text-2xl font-bold bg-slate-800 border-2 rounded-xl text-white focus:outline-none transition-all duration-150"
                        style={{
                          borderColor: digit ? 'rgb(99, 102, 241)' : 'rgb(71, 85, 105)',
                          boxShadow: digit ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                        }}
                        maxLength={1}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {/* Resend */}
                  <div className="text-center mt-3">
                    {countdown > 0 ? (
                      <p className="text-slate-500 text-sm">
                        Resend in <span className="text-primary-400 font-semibold tabular-nums">{String(countdown).padStart(2, '0')}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Didn't receive it? Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input-field pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="btn-emerald w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    <>Reset Password <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          <div className="divider mt-6" />
          <p className="text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
