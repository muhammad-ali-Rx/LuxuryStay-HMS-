"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react"
import FrontendNavbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

const API_BASE_URL = "http://localhost:3000"

export default function UserRegister() {
  const navigate = useNavigate()
  const { setUserFromAPI } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "user",
        }),
      })

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
      const data = await response.json()

      setUserFromAPI(data)
      navigate("/booking", { state: { from: "register", message: "Registration successful!" } })
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] via-[#0d244d] to-[#091a37] text-gray-800 relative overflow-hidden">
      {/* Luxury glowing background circles */}
      <div className="absolute top-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-12rem] left-[-12rem] w-[25rem] h-[25rem] bg-[#D4AF37]/10 rounded-full blur-3xl"></div>

      <FrontendNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="relative bg-white/95 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a5c] px-10 py-12 text-center relative">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white mb-2 tracking-wide"
              >
                Create Account
              </motion.h1>
              <p className="text-white/80 text-sm">Experience luxury stays like never before</p>

              {/* Golden line below heading */}
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-[2px] bg-[#D4AF37] rounded-full"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 312 1234567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#D4AF37]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#D4AF37]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start text-sm">
                <input type="checkbox" className="mt-1 w-4 h-4 text-[#D4AF37] focus:ring-0" />
                <span className="ml-2 text-gray-600">
                  I agree to the{" "}
                  <Link to="#" className="text-[#D4AF37] hover:text-[#0A1F44] font-semibold">
                    Terms & Conditions
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(212,175,55,0.5)" }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#c6a437] text-[#0A1F44] font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="bg-[#fafafa] border-t border-gray-200 px-8 py-5 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-[#D4AF37] hover:text-[#0A1F44] font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
