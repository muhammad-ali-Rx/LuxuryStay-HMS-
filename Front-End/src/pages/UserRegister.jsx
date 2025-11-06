import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Lock, User, MapPin, Eye, EyeOff, CheckCircle, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const API_BASE_URL = "http://localhost:3000"

const SLIDER_IMAGES = ["/luxury-hotel-room.jpg", "/luxury-resort-pool.jpg", "/luxury-spa.jpg", "/luxury-dining.jpg"]

export default function UserRegisterMultiStep() {
  const navigate = useNavigate()
  const { setUserFromAPI } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [sliderIndex, setSliderIndex] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(0)
  const [canResendOTP, setCanResendOTP] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % SLIDER_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (step === 2 && otpTimeRemaining > 0) {
      const interval = setInterval(() => {
        setOtpTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, otpTimeRemaining])

  const handleBackClick = () => {
    navigate("/")
  }

  const nextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % SLIDER_IMAGES.length)
  }

  const prevSlide = () => {
    setSliderIndex((prev) => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length)
  }

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email) {
        setError("Please enter your email")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to send OTP")
        return
      }

      setOtpTimeRemaining(data.expiresIn || 600)
      setCanResendOTP(false)
      setOtp("")
      setSuccessMessage("OTP sent to your email!")
      setTimeout(() => {
        setStep(2)
        setSuccessMessage("")
      }, 1500)
    } catch (err) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP")
        return
      }

      setOtpTimeRemaining(data.expiresIn || 600)
      setCanResendOTP(false)
      setOtp("")
      setSuccessMessage("New OTP sent to your email!")
    } catch (err) {
      setError(err.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!otp) {
        setError("Please enter the OTP")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Invalid OTP")
        return
      }

      setSuccessMessage("OTP verified successfully!")
      setTimeout(() => {
        setStep(3)
        setSuccessMessage("")
      }, 1500)
    } catch (err) {
      setError(err.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set Password
  const handleSetPassword = (e) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setSuccessMessage("Password set successfully!")
    setTimeout(() => {
      setStep(4)
      setSuccessMessage("")
    }, 1500)
  }

  // Step 4: Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!name) {
        setError("Please enter your name")
        setLoading(false)
        return
      }

      if (!agreeTerms) {
        setError("Please agree to terms and conditions")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          address,
          profileImage,
        }),
      })
      const data = await response.json()

      setUserFromAPI(data)
      navigate("/booking", { state: { from: "register", message: "Registration successful!" } })
    } catch (err) {
      setError(err.message || "Failed to complete registration")
    } finally {
      setLoading(false)
    }
  }

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] via-[#1a3a5c] to-[#0A1F44] overflow-hidden">
      <motion.button
        onClick={handleBackClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-white hover:bg-[#D4AF37] hover:text-[#0A1F44] hover:border-[#D4AF37] transition-all shadow-lg hover:shadow-[0_0_20px_#D4AF37]/50"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-semibold">Back</span>
      </motion.button>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="hidden lg:flex flex-col items-center justify-center relative h-screen bg-gradient-to-br from-[#081429] via-[#1a3a5c] to-[#0A1F44] p-8"
          >
            <div className="relative w-full max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/20 bg-black/40">
                <motion.img
                  key={sliderIndex}
                  src={SLIDER_IMAGES[sliderIndex]}
                  alt="Luxury Stay"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A1F44]/80"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.15, backgroundColor: "#D4AF37" }}
                whileTap={{ scale: 0.95 }}
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:text-[#0A1F44] transition-all border border-[#D4AF37]/30 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15, backgroundColor: "#D4AF37" }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:text-[#0A1F44] transition-all border border-[#D4AF37]/30 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>

              <div className="flex justify-center gap-3 mt-8">
                {SLIDER_IMAGES.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSliderIndex(index)}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                    className={`rounded-full transition-all ${
                      index === sliderIndex
                        ? "bg-[#D4AF37] w-8 h-3 shadow-lg shadow-[#D4AF37]/50"
                        : "bg-white/20 w-3 h-3 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-12 text-center text-white">
                <h3 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#D4AF37] via-[#e8d5b7] to-[#D4AF37] bg-clip-text">
                  Experience Luxury
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-sm mx-auto font-light">
                  Join thousands of satisfied guests enjoying our world-class accommodations and premium services
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center h-screen lg:h-auto p-4 lg:p-8 lg:pr-12"
          >
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* Progress Bar */}
                <div className="px-8 pt-8">
                  <div className="flex gap-3 mb-8">
                    {[1, 2, 3, 4].map((indicator) => (
                      <motion.div
                        key={indicator}
                        className={`flex-1 h-2.5 rounded-full transition-all ${
                          indicator < step
                            ? "bg-[#D4AF37]"
                            : indicator === step
                              ? "bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50"
                              : "bg-white/20"
                        }`}
                        layoutId={`progress-${indicator}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="px-8 py-8 text-center border-b border-white/10 bg-gradient-to-r from-[#D4AF37]/10 to-[#e8d5b7]/5">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {step === 1 && "Verify Your Email"}
                    {step === 2 && "Enter OTP Code"}
                    {step === 3 && "Create Password"}
                    {step === 4 && "Your Profile"}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed font-light">
                    {step === 1 && "We'll send you a verification code to get started"}
                    {step === 2 && "Check your email for the verification code"}
                    {step === 3 && "Create a secure password for your account"}
                    {step === 4 && "Tell us a bit about yourself"}
                  </p>
                </div>

                {/* Form Content */}
                <form className="p-8 space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-900/30 border border-red-600/50 text-red-300 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {error}
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-900/30 border border-green-600/50 text-green-300 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {successMessage}
                    </motion.div>
                  )}

                  {/* Step 1: Email */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <label className="block text-sm font-semibold text-white mb-3">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-[#D4AF37]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-white/20 rounded-xl bg-white/5 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-500 text-white font-medium"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendOTP}
                        disabled={loading}
                        type="button"
                        className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#e8d5b7] text-[#0A1F44] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-[#D4AF37]/30 transform hover:translate-y-[-2px]"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: OTP */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-white">Verification Code</label>
                        <span
                          className={`text-xs font-mono font-bold ${otpTimeRemaining > 60 ? "text-green-400" : otpTimeRemaining > 0 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {otpTimeRemaining > 0 ? `${formatTimeRemaining(otpTimeRemaining)} left` : "Expired"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        Enter the 6-digit code sent to <span className="font-semibold text-gray-200">{email}</span>
                      </p>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                        placeholder="000000"
                        maxLength="6"
                        className="w-full px-4 py-4 border-2 border-white/20 rounded-xl bg-white/5 text-center text-4xl tracking-[0.5rem] focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-600 text-white font-mono font-bold"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerifyOTP}
                        disabled={loading || otpTimeRemaining === 0}
                        type="button"
                        className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#e8d5b7] text-[#0A1F44] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-[#D4AF37]/30 transform hover:translate-y-[-2px]"
                      >
                        {loading ? "Verifying..." : "Verify Code"}
                      </motion.button>
                      {canResendOTP && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={handleResendOTP}
                          disabled={loading}
                          type="button"
                          className="w-full mt-3 text-[#D4AF37] hover:text-white font-semibold py-2.5 text-sm bg-[#D4AF37]/10 rounded-lg hover:bg-[#D4AF37]/20 transition border border-[#D4AF37]/30 hover:border-[#D4AF37]"
                        >
                          {loading ? "Sending..." : "Resend OTP"}
                        </motion.button>
                      )}
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full mt-3 text-[#D4AF37] hover:text-white font-semibold py-2.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition"
                      >
                        Change Email
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Password */}
                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 w-5 h-5 text-[#D4AF37]" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3.5 border-2 border-white/20 rounded-xl bg-white/5 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-500 text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-[#D4AF37] transition"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 w-5 h-5 text-[#D4AF37]" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3.5 border-2 border-white/20 rounded-xl bg-white/5 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-500 text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-[#D4AF37] transition"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSetPassword}
                        type="button"
                        className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#e8d5b7] text-[#0A1F44] font-bold py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30 transform hover:translate-y-[-2px]"
                      >
                        Continue
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 4: Profile */}
                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-4 w-5 h-5 text-[#D4AF37]" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-white/20 rounded-xl bg-white/5 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-500 text-white font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#D4AF37]" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Luxury Ave"
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-white/20 rounded-xl bg-white/5 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:bg-white/10 transition placeholder-gray-500 text-white font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">Profile Picture</label>
                        <div className="flex items-end gap-4">
                          {profileImage ? (
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt="Profile"
                              className="w-20 h-20 rounded-xl object-cover border-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border-2 border-dashed border-[#D4AF37]/30 flex-shrink-0">
                              <Upload className="w-8 h-8 text-[#D4AF37]/60" />
                            </div>
                          )}
                          <label className="flex-1">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <span className="block px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-sm font-semibold text-white cursor-pointer hover:bg-white/20 hover:border-[#D4AF37]/50 transition text-center">
                              Choose Image
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-[#D4AF37]/10 to-[#e8d5b7]/5 p-4 rounded-xl border border-[#D4AF37]/20">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-2 border-[#D4AF37] accent-[#D4AF37] cursor-pointer mt-0.5 flex-shrink-0"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
                          I agree to the <span className="text-[#D4AF37] font-semibold">Terms and Conditions</span> and{" "}
                          <span className="text-[#D4AF37] font-semibold">Privacy Policy</span>
                        </label>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCompleteRegistration}
                        disabled={loading || !agreeTerms}
                        type="button"
                        className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#e8d5b7] text-[#0A1F44] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-[#D4AF37]/30 transform hover:translate-y-[-2px]"
                      >
                        {loading ? "Creating Account..." : "Complete Registration"}
                      </motion.button>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
