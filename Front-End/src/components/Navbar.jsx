import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Phone, MapPin, ChevronDown, User, LogOut, Settings, Calendar } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function FrontendNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const location = useLocation()
  const auth = useAuth()

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/rooms", label: "Suites" },
    { href: "/dining", label: "Dining" },
    { href: "/facilities", label: "Facilities" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Main Container - Now scrolls with content */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}>
        {/* Subtle Top Bar */}
        <div className="bg-slate-800 text-slate-200 py-2 px-4 text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span className="text-slate-300">+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-slate-300">Lahore, Pakistan</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-xs">
              <span>5-Star Luxury Hotel</span>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <span>24/7 Concierge</span>
            </div>
          </div>
        </div>

        {/* Main Navigation - No longer fixed, scrolls with content */}
        <nav
          className={`bg-white transition-all duration-300 ${
            scrolled 
              ? "border-b border-slate-100 py-2" 
              : "py-3"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Clean Logo */}
              <Link 
                to="/home" 
                className="flex items-center gap-3 flex-shrink-0 group"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="font-bold text-white text-lg tracking-tight font-serif">LS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900 font-serif tracking-tight">
                    LuxuryStay
                  </span>
                  <span className="text-xs text-slate-500 tracking-widest uppercase font-medium">
                    Hotels & Resorts
                  </span>
                </div>
              </Link>

              {/* Clean Desktop Navigation */}
              <div className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-6 py-3 text-slate-600 font-medium text-sm uppercase tracking-wide transition-all duration-200 group ${
                      location.pathname === link.href ? "text-slate-900 font-semibold" : "hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-slate-900 transition-all duration-200 ${
                      location.pathname === link.href ? "w-3/4" : "group-hover:w-3/4"
                    }`}></div>
                  </Link>
                ))}
              </div>

              {/* Clean Desktop Auth & Actions */}
              <div className="hidden lg:flex items-center gap-3">
                {auth && auth.isAuthenticated && auth.userAuth ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {auth.userAuth.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-slate-800">
                          {auth.userAuth.name?.split(' ')[0] || "User"}
                        </span>
                        <span className="text-xs text-slate-500">
                          My Account
                        </span>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                      />
                    </button>

                    {/* Clean Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900">{auth.userAuth.name}</p>
                          <p className="text-xs text-slate-500 truncate">{auth.userAuth.email}</p>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            to="/reservations"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Calendar size={16} className="text-slate-500" />
                            <span>My Bookings</span>
                          </Link>

                          {auth.canAccessAdmin() && (
                            <Link
                              to="/admin"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Settings size={16} className="text-slate-500" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              auth.logoutUser()
                              setIsDropdownOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-2 text-slate-700 hover:text-slate-900 font-medium text-sm rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                
                {/* Clean Book Now Button */}
                <Link
                  to="/booking"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                >
                  <span>Book Now</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Clean Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute left-0 top-1 w-6 h-0.5 bg-slate-600 rounded transition-all duration-200 ${
                    isOpen ? "rotate-45 top-3" : ""
                  }`}></span>
                  <span className={`absolute left-0 top-3 w-6 h-0.5 bg-slate-600 rounded transition-all duration-200 ${
                    isOpen ? "opacity-0" : ""
                  }`}></span>
                  <span className={`absolute left-0 top-5 w-6 h-0.5 bg-slate-600 rounded transition-all duration-200 ${
                    isOpen ? "-rotate-45 top-3" : ""
                  }`}></span>
                </div>
              </button>
            </div>

            {/* Clean Mobile Navigation */}
            <div
              className={`lg:hidden transition-all duration-300 ease-out overflow-hidden ${
                isOpen ? "max-h-[600px] opacity-100 py-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 space-y-2">
                {/* Mobile Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-slate-700 font-medium rounded-lg transition-colors ${
                        location.pathname === link.href 
                          ? "bg-slate-100 text-slate-900 font-semibold" 
                          : "hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  {auth && auth.isAuthenticated && auth.userAuth ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-medium">
                          {auth.userAuth.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{auth.userAuth.name}</p>
                          <p className="text-xs text-slate-500 truncate">{auth.userAuth.email}</p>
                        </div>
                      </div>

                      <Link
                        to="/reservations"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Calendar size={18} className="text-slate-500" />
                        <span className="font-medium">My Bookings</span>
                      </Link>

                      {auth.canAccessAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Settings size={18} className="text-slate-500" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          auth.logoutUser()
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <User size={18} className="text-slate-500" />
                      <span className="font-medium">Sign In</span>
                    </Link>
                  )}

                  {/* Mobile Book Now Button */}
                  <Link
                    to="/booking"
                    onClick={() => setIsOpen(false)}
                    className="block bg-slate-900 hover:bg-slate-800 text-white text-center py-3 font-semibold rounded-lg transition-colors mt-3"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}