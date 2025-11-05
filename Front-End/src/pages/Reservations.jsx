"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, Clock, Trash2, Eye } from "lucide-react"
import FrontendNavbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

export default function Reservations() {
  const { userAuth } = useAuth()
  const [reservations, setReservations] = useState([
    {
      id: 1,
      roomType: "Deluxe Suite",
      roomNumber: "401",
      checkIn: "2025-01-15",
      checkOut: "2025-01-18",
      guests: 2,
      status: "confirmed",
      totalPrice: 450,
    },
    {
      id: 2,
      roomType: "Ocean View Room",
      roomNumber: "502",
      checkIn: "2025-02-01",
      checkOut: "2025-02-05",
      guests: 3,
      status: "pending",
      totalPrice: 600,
    },
  ])

  const handleCancelReservation = (id) => {
    setReservations(reservations.filter((res) => res.id !== id))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar />

      {/* Header Section */}
      <div className="pt-32 pb-12 px-4 bg-gradient-to-br from-[#0A1F44]/5 to-[#D4AF37]/5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-2">My Reservations</h1>
          <p className="text-lg text-gray-600">
            Welcome, <span className="font-semibold text-[#D4AF37]">{userAuth?.name}</span>
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-300"
          >
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Reservations Yet</h2>
            <p className="text-gray-600 mb-6">Start your luxury getaway by booking a room today!</p>
            <a
              href="/booking"
              className="inline-block bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Make a Reservation
            </a>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {reservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                variants={itemVariants}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Room Type */}
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2">ROOM</p>
                    <p className="text-lg font-bold text-[#0A1F44] mb-1">{reservation.roomType}</p>
                    <p className="text-sm text-gray-600">Room #{reservation.roomNumber}</p>
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                      <Calendar size={16} /> CHECK-IN
                    </p>
                    <p className="text-lg font-bold text-[#0A1F44]">{reservation.checkIn}</p>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                      <Clock size={16} /> CHECK-OUT
                    </p>
                    <p className="text-lg font-bold text-[#0A1F44]">{reservation.checkOut}</p>
                  </div>

                  {/* Guests */}
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                      <Users size={16} /> GUESTS
                    </p>
                    <p className="text-lg font-bold text-[#0A1F44]">{reservation.guests}</p>
                  </div>
                </div>

                {/* Status and Price */}
                <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(reservation.status)}`}
                    >
                      {reservation.status}
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold text-[#D4AF37]">${reservation.totalPrice}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full md:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-[#0A1F44] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      <Eye size={18} />
                      <span>View Details</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition-all duration-300"
                    >
                      <Trash2 size={18} />
                      <span>Cancel</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
