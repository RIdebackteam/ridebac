import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Calendar, Users, Shield, Clock, Leaf, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-mesh">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight text-balance"
            >
              Travel Together. <br className="hidden md:block"/>
              <span className="text-gradient">Save Together.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            >
              India's most trusted inter-city carpooling platform. Share your journey, split the costs, and make new friends along the way.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/search" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                Find a Ride
              </Link>
              <Link to="/register" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
                Offer a Ride
              </Link>
            </motion.div>

            {/* Quick Search Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-3 rounded-2xl max-w-3xl mx-auto shadow-2xl shadow-primary-900/20"
            >
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Leaving from" className="w-full bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Going to" className="w-full bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="date" className="w-full bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex items-center justify-center">
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Users', value: '1,000+' },
              { label: 'Rides Shared', value: '200+' },
              { label: 'Cities Covered', value: '50+' },
              { label: 'Average Rating', value: '4.8★' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Why choose RideBack?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We're building a community based on trust, convenience, and sustainability.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-900/50 text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Safe & Verified</h3>
              <p className="text-slate-400">Every member is verified with government ID. Check profiles and reviews before you ride.</p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-emerald-900/50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Eco-Friendly</h3>
              <p className="text-slate-400">Reduce your carbon footprint by filling empty seats and taking cars off the road.</p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-amber-900/50 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Save Money</h3>
              <p className="text-slate-400">Share travel costs and save up to 70% compared to bus or train tickets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden glass p-12 text-center border border-primary-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-emerald-600/20" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to ride smarter?</h2>
              <p className="text-xl text-slate-300 mb-8">Join thousands of Indians who are already saving money and making travel fun again.</p>
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Create an Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
