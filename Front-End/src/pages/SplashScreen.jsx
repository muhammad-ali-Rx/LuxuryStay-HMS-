"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function SplashScreen({ onSplashComplete }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (onSplashComplete) {
        onSplashComplete()
      }
      navigate("/home")
    }, 4000)
    return () => clearTimeout(timer)
  }, [navigate, onSplashComplete])

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#0A1F44] via-[#1a3a5c] to-[#0A1F44] flex items-center justify-center overflow-hidden relative">
      {/* Top accent circle */}
      <motion.div
        className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-br from-[#D4AF37] to-[#B8940F] rounded-full blur-3xl opacity-20"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Bottom accent circle */}
      <motion.div
        className="absolute bottom-20 -right-40 w-80 h-80 bg-gradient-to-tl from-[#D4AF37] to-[#B8940F] rounded-full blur-3xl opacity-15"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main content container */}
      <motion.div
        className="z-10 text-center px-4 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Logo animation */}
        <motion.div
          className="mb-12"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            className="inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="text-7xl font-serif font-bold text-[#D4AF37] tracking-wider">LuxuryStay</div>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4 mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          />

          <motion.p
            className="text-lg text-white/70 font-light tracking-[0.3em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Hotel Management System
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <p className="text-white/60 text-base font-light tracking-widest mb-2">EXPERIENCE ELEGANCE</p>
          <p className="text-white/50 text-sm">Refined luxury management at your fingertips</p>
        </motion.div>

        {/* Loading animation - Luxury style */}
        <div className="flex justify-center items-center gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#D4AF37] rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.8,
                delay: i * 0.15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading text with animation */}
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-white/60 text-xs tracking-widest uppercase">Preparing your experience</span>
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-[#D4AF37]"
          >
            •
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mt-12 h-1 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8940F]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom accent text */}
      <motion.div
        className="absolute bottom-8 text-center w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white/40 text-xs tracking-[0.2em] uppercase">Premium Hotel Management</p>
      </motion.div>
    </div>
  )
}
