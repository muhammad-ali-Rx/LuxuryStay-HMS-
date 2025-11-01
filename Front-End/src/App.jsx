"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { AuthProvider } from "./context/AuthContext"

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminPanel from "./pages/admin/AdminPanel"

// Frontend Pages (to be created)
import Home from "./pages/Home"
import Rooms from "./pages/Rooms"
import RoomDetail from "./pages/RoomDetail"
import Booking from "./pages/Booking"
import Contact from "./pages/Contact"
import Dining from "./pages/Dining"
import Facilities from "./pages/Facilities"
import Gallery from "./pages/Gallery"
import ConfirmationPage from "./pages/BookingConfirmation"

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Frontend Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dining" element={<Dining />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/BookingConfirmation" element={<ConfirmationPage />} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  )
}
