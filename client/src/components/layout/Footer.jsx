import { Link } from 'react-router-dom'
import { Car, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t-0 border-x-0 rounded-none mt-20 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RideBack</span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              India's most trusted inter-city carpooling platform. Travel smarter, save money, and reduce your carbon footprint.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://twitter.com/" 
              target="_blank"
               rel="noopener noreferrer"
  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/kr-abhinav03"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/choudharyabhinav03/"
              target="_blank"
              rel="noopener noreferrer"
  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-slate-400 hover:text-primary-400 transition-colors">Find a Ride</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-primary-400 transition-colors">Offer a Ride</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">How it Works</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">Safety</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-700/50 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} RideBack Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
