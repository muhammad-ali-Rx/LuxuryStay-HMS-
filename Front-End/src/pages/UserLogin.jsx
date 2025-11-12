import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react" // Fixed import
import FrontendNavbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

const API_BASE_URL = "http://localhost:3000"

export default function UserLogin() {
  const navigate = useNavigate()
  const { setUserFromAPI } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Login response status:", response.status)

      if (!response.ok) {
        const text = await response.text()
        console.log("[v0] Error response text:", text)
        throw new Error(`HTTP Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Login data received:", data)

      const user = setUserFromAPI(data)

      // Add null check for user
      if (!user || !user.role) {
        setError("Invalid user data received")
        setLoading(false)
        return
      }

      if (user.role === "guest") {
        navigate("/reservations", { state: { from: "login" } })
      } else if (["admin", "manager", "receptionist", "housekeeping", "staff"].includes(user.role)) {
        navigate("/admin", { state: { from: "login" } })
      } else {
        navigate("/booking", { state: { from: "login" } })
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add the missing quick login functions
  const handleQuickAdminLogin = () => {
    setEmail("admin@luxurystay.com")
    setPassword("admin123")
  }

  const handleQuickUserLogin = () => {
    setEmail("user@example.com")
    setPassword("password123")
  }

  return (
    <div className="min-h-screen bg-[#1D293D]">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-3">Welcome Back</h1>
                <p className="text-white/70 text-lg">Sign in to your LuxuryStay account</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C3888] focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C3888] focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-[#1C3888] rounded focus:ring-0" />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <Link to="#" className="text-sm text-[#1C3888] hover:text-[#1C3888]/80 font-semibold transition">
                        Forgot Password?
                      </Link>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1C3888] text-white font-semibold py-4 rounded-xl hover:bg-[#1C3888]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          Sign In
                        </>
                      )}
                    </motion.button>

                    {/* Development Quick Access */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="space-y-2 pt-4 border-t border-gray-200">
                        <p className="text-center text-xs text-gray-500 mb-2">Development Quick Access:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleQuickAdminLogin}
                            className="bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Quick Admin
                          </button>
                          <button
                            type="button"
                            onClick={handleQuickUserLogin}
                            className="bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Quick User
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-gray-600 text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#1C3888] hover:text-[#1C3888]/80 font-semibold transition">
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 p-4">
                  <div className="text-center">
                    <p className="text-gray-600 text-xs font-medium mb-1">Endpoint: /users/login</p>
                    <p className="text-gray-500 text-xs">Connected to backend API</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="text-center text-white max-w-lg">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <LogIn className="w-12 h-12 text-white" />
              </div>

              {/* Main Content */}
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Welcome to
                <span className="block text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">LuxuryStay</span>
              </h2>

              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Access your personalized dashboard and manage your hotel experience with ease.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-3 text-white/70">
                  <div className="w-2 h-2 bg-[#1C3888] rounded-full"></div>
                  <span className="text-lg">Manage your bookings and reservations</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-white/70">
                  <div className="w-2 h-2 bg-[#1C3888] rounded-full"></div>
                  <span className="text-lg">Access exclusive member benefits</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-white/70">
                  <div className="w-2 h-2 bg-[#1C3888] rounded-full"></div>
                  <span className="text-lg">View your stay history and preferences</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-white/70">
                  <div className="w-2 h-2 bg-[#1C3888] rounded-full"></div>
                  <span className="text-lg">Get personalized recommendations</span>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-[#1C3888]" />
                  <span className="text-white font-semibold">Secure Login</span>
                </div>
                <p className="text-white/70 text-sm">
                  Your account security is our priority. All login information is encrypted and protected.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}