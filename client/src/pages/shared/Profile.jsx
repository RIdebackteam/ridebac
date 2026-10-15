import { useState, useEffect } from 'react'
import { User, Car, Star, Lock, Save, Loader, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { vehicleTypeLabel } from '../../utils/formatters'

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'vehicle', label: 'Vehicle', icon: Car, driverOnly: true },
  { id: 'security', label: 'Security', icon: Lock },
]

export default function Profile() {
  const { user, updateUser, isDriver } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [vehicle, setVehicle] = useState({ vehicleName: '', vehicleNumber: '', vehicleType: 'sedan', licenseNumber: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [loadingVehicle, setLoadingVehicle] = useState(false)

  useEffect(() => {
    if (isDriver) fetchVehicle()
  }, [isDriver])

  const fetchVehicle = async () => {
    setLoadingVehicle(true)
    try {
      const res = await api.get('/driver/profile')
      const d = res.data.data.driver
      setVehicle({
        vehicleName: d.vehicleName || '',
        vehicleNumber: d.vehicleNumber || '',
        vehicleType: d.vehicleType || 'sedan',
        licenseNumber: d.licenseNumber || '',
      })
    } catch {
      // No profile yet
    } finally {
      setLoadingVehicle(false)
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile', profile)
      updateUser(res.data.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveVehicle = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/driver/profile', vehicle)
      toast.success('Vehicle info saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle info')
    } finally {
      setSaving(false)
    }
  }

  const visibleTabs = tabs.filter((t) => !t.driverOnly || isDriver)

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="glass p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-black text-2xl">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${isDriver ? 'badge-primary' : 'badge-emerald'} capitalize`}>
              {user?.role}
            </span>
          </div>
          <div className="ml-auto">
            <p className="text-xs text-slate-500 mb-1">Account status</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${user?.isVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`text-xs font-medium ${user?.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <nav className="glass p-2 space-y-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            {/* Personal Info */}
            {activeTab === 'personal' && (
              <form onSubmit={saveProfile} className="card space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary-400" /> Personal Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    className="input-field"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <input className="input-field opacity-50 cursor-not-allowed" value={user?.email} disabled />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    className="input-field"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            )}

            {/* Vehicle Info (Driver only) */}
            {activeTab === 'vehicle' && isDriver && (
              <form onSubmit={saveVehicle} className="card space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary-400" /> Vehicle Information
                </h2>
                {loadingVehicle ? (
                  <div className="flex justify-center py-8">
                    <Loader className="w-8 h-8 text-primary-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Vehicle Name</label>
                      <input
                        className="input-field"
                        value={vehicle.vehicleName}
                        onChange={(e) => setVehicle((p) => ({ ...p, vehicleName: e.target.value }))}
                        placeholder="e.g. Maruti Swift"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Vehicle Type</label>
                      <select
                        className="input-field"
                        value={vehicle.vehicleType}
                        onChange={(e) => setVehicle((p) => ({ ...p, vehicleType: e.target.value }))}
                      >
                        {Object.entries(vehicleTypeLabel).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Registration Number</label>
                      <input
                        className="input-field uppercase"
                        value={vehicle.vehicleNumber}
                        onChange={(e) => setVehicle((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                        placeholder="MH12AB1234"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Driving License Number</label>
                      <input
                        className="input-field"
                        value={vehicle.licenseNumber}
                        onChange={(e) => setVehicle((p) => ({ ...p, licenseNumber: e.target.value }))}
                        placeholder="DL-XXXXXXXXXX"
                        required
                      />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Vehicle Info
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="card space-y-6">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-400" /> Security
                </h2>
                <div className="p-4 bg-amber-900/20 rounded-xl border border-amber-700/30">
                  <p className="text-amber-400 text-sm font-medium mb-1">Password Reset</p>
                  <p className="text-slate-400 text-sm">
                    To change your password, use the{' '}
                    <a href="/forgot-password" className="text-primary-400 hover:underline">Forgot Password</a>{' '}
                    flow — enter your email and we'll send an OTP.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                    <div>
                      <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-slate-400 text-xs">Coming soon</p>
                    </div>
                    <span className="badge badge-slate">Unavailable</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-white text-sm font-medium">Account Verified</p>
                      <p className="text-slate-400 text-xs">OTP verification status</p>
                    </div>
                    <span className={`badge ${user?.isVerified ? 'badge-emerald' : 'badge-amber'}`}>
                      {user?.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
