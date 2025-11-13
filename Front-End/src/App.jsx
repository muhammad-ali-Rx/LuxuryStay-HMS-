"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"

// Splash Screen
import SplashScreen from "./pages/SplashScreen"

// User Pages
import Home from "./pages/Home"
import Rooms from "./pages/Rooms"
import RoomDetail from "./pages/RoomDetail"
import Booking from "./pages/Booking"
import Contact from "./pages/Contact"
import Dining from "./pages/Dining"
import Facilities from "./pages/Facilities"
import Gallery from "./pages/Gallery"
import ConfirmationPage from "./pages/BookingConfirmation"
import UserLogin from "./pages/UserLogin"
import UserRegister from "./pages/UserRegister"
import Reservations from "./pages/Reservations"

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminPanel from "./pages/admin/AdminPanel"

// Protected Route Component for User Booking
function ProtectedBookingRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "booking" }} replace />
  }

  return <Booking />
}

function ProtectedReservationsRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "reservations" }} replace />
  }

  return <Reservations />
}

function ProtectedAdminRoute() {
  const { adminUser, loading } = useAuth()

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  const adminRoles = ["admin", "manager", "receptionist", "housekeeping"]
  if (!adminUser || !adminRoles.includes(adminUser.role)) {
    return <Navigate to="/admin" replace />
  }

  return <AdminPanel />
}

function AppRoutes() {
  const [splashShown, setSplashShown] = useState(() => {
    return localStorage.getItem("splashShown") === "true"
  })

  useEffect(() => {
    if (splashShown) {
      localStorage.setItem("splashShown", "true")
    }
  }, [splashShown])

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />

        {/* Splash Screen - only shown once */}
        <Route
          path="/splash"
          element={
            <SplashScreen
              onSplashComplete={() => {
                setSplashShown(true)
                localStorage.setItem("splashShown", "true")
              }}
            />
          }
        />

        {/* User Frontend Routes - Public */}
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* User Auth Routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* Protected Booking Routes - Requires Authentication */}
        <Route path="/booking" element={<ProtectedBookingRoute />} />
        <Route path="/BookingConfirmation" element={<ConfirmationPage />} />

        <Route path="/reservations" element={<ProtectedReservationsRoute />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
