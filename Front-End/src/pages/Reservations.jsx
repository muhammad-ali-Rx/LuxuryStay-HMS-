"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, Clock, Trash2, Eye, Loader, AlertCircle, Hotel, DollarSign } from "lucide-react"
import FrontendNavbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const API_BASE_URL = "http://localhost:3000/booking"

export default function Reservations() {
  const { userAuth, isAuthenticated, getToken } = useAuth()
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancellingId, setCancellingId] = useState(null)

  // Fetch user's bookings from backend
  useEffect(() => {
    if (isAuthenticated && userAuth) {
      fetchUserBookings()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, userAuth])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      console.log("🔐 Fetching user bookings with token:", token.substring(0, 20) + "...")

      const response = await fetch(`${API_BASE_URL}/my-bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log("📨 Response status:", response.status)

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch bookings (Status: ${response.status})`)
      }

      const result = await response.json()
      console.log("📋 User bookings response:", result)
      
      if (result.success) {
        // ✅ FIX: Use your actual database field names
        const bookingsWithFixedData = result.data.map(booking => {
          // Your database uses 'bookingStatus' instead of 'status'
          // and has room details directly in the booking object
          return {
            ...booking,
            status: booking.bookingStatus || booking.status, // Map to status for UI
            roomType: booking.roomType || "Deluxe Room",
            roomNumber: booking.roomNumber || "N/A",
            totalAmount: booking.totalAmount || 0
          }
        })
        
        setReservations(bookingsWithFixedData)
      } else {
        throw new Error(result.message || "Failed to load bookings")
      }
      
    } catch (error) {
      console.error("❌ Error fetching bookings:", error)
      setError(error.message || "Failed to load your reservations")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return
    }

    try {
      setCancellingId(bookingId)
      const token = getToken()
      console.log("🗑️ Cancelling booking:", bookingId)

      // ✅ FIX: Use the correct endpoint based on your backend
      const response = await fetch(`${API_BASE_URL}/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log("📨 Cancel response status:", response.status)

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to cancel booking (Status: ${response.status})`)
      }

      const result = await response.json()
      console.log("✅ Cancel response:", result)
      
      if (result.success) {
        // Update local state - mark as cancelled
        setReservations(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { 
                  ...booking, 
                  status: 'cancelled',
                  bookingStatus: 'cancelled' // Update both fields
                }
              : booking
          )
        )
        
        // Show success message
        alert("✅ Booking cancelled successfully!")
        
        // Refresh the bookings list to get updated data
        setTimeout(() => {
          fetchUserBookings()
        }, 1000)
        
      } else {
        throw new Error(result.message || "Failed to cancel booking")
      }
      
    } catch (error) {
      console.error("❌ Error cancelling booking:", error)
      alert(`❌ ${error.message || "Failed to cancel booking. Please try again."}`)
    } finally {
      setCancellingId(null)
    }
  }

  const handleViewDetails = (booking) => {
    navigate(`/booking-details/${booking._id}`, { state: { booking } })
  }

  const getStatusColor = (status) => {
    const statusValue = status?.toLowerCase()
    switch (statusValue) {
      case "confirmed":
      case "approved":
        return "bg-green-100 text-green-800 border border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300"
      case "checked-in":
        return "bg-blue-100 text-blue-800 border border-blue-300"
      case "checked-out":
      case "completed":
        return "bg-purple-100 text-purple-800 border border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    try {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      return nights > 0 ? nights : 0
    } catch (error) {
      return 0
    }
  }

  const calculateTotalPrice = (booking) => {
    // Use the totalAmount from your database directly
    return booking.totalAmount || 0
  }

  const calculatePricePerNight = (booking) => {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate)
    return nights > 0 ? Math.round(booking.totalAmount / nights) : 0
  }

  const canCancelBooking = (booking) => {
    const status = booking.status?.toLowerCase() || booking.bookingStatus?.toLowerCase()
    const cancellableStatuses = ['pending', 'confirmed']
    return cancellableStatuses.includes(status)
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

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <FrontendNavbar />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please login to view your reservations</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    )
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
          {reservations.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {reservations.length} booking{reservations.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <Loader className="animate-spin mx-auto mb-4 text-[#D4AF37]" size={48} />
            <p className="text-gray-600">Loading your reservations...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-red-50 rounded-2xl border border-red-200"
          >
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Error Loading Reservations</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchUserBookings}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/booking')}
                className="bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-300"
          >
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Reservations Yet</h2>
            <p className="text-gray-600 mb-6">Start your luxury getaway by booking a room today!</p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Make a Reservation
            </button>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {reservations.map((reservation) => {
              const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate)
              const totalPrice = calculateTotalPrice(reservation)
              const pricePerNight = calculatePricePerNight(reservation)
              const canCancel = canCancelBooking(reservation)
              const isCancelling = cancellingId === reservation._id
              
              return (
                <motion.div
                  key={reservation._id}
                  variants={itemVariants}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Room Type */}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                        <Hotel size={16} /> ROOM
                      </p>
                      <p className="text-lg font-bold text-[#0A1F44] mb-1">
                        {reservation.roomType || "Deluxe Room"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Room #{reservation.roomNumber || "N/A"}
                      </p>
                      <p className="text-sm text-[#D4AF37] font-semibold flex items-center gap-1">
                        <DollarSign size={14} />
                        {pricePerNight}/night
                      </p>
                    </div>

                    {/* Check-in Date */}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                        <Calendar size={16} /> CHECK-IN
                      </p>
                      <p className="text-lg font-bold text-[#0A1F44]">
                        {formatDate(reservation.checkInDate)}
                      </p>
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                        <Clock size={16} /> CHECK-OUT
                      </p>
                      <p className="text-lg font-bold text-[#0A1F44]">
                        {formatDate(reservation.checkOutDate)}
                      </p>
                    </div>

                    {/* Guests & Nights */}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-2 flex items-center gap-2">
                        <Users size={16} /> GUESTS & NIGHTS
                      </p>
                      <p className="text-lg font-bold text-[#0A1F44]">
                        {reservation.numberOfGuests} guests
                      </p>
                      <p className="text-sm text-gray-600">
                        {nights} night{nights !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Status and Price */}
                  <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(reservation.status)}`}
                      >
                        {reservation.status || reservation.bookingStatus}
                      </span>
                      <div>
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="text-2xl font-bold text-[#D4AF37] flex items-center gap-1">
                          <DollarSign size={20} />
                          {totalPrice}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(reservation)}
                        className="flex items-center gap-2 bg-[#0A1F44] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        <Eye size={18} />
                        <span>View Details</span>
                      </motion.button>

                      {canCancel && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelReservation(reservation._id)}
                          disabled={isCancelling}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                            isCancelling
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {isCancelling ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                          <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {reservation.specialRequests && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-500 font-semibold mb-1">Special Requests</p>
                      <p className="text-gray-700 text-sm">{reservation.specialRequests}</p>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-gray-500">
                      Booked on: {formatDate(reservation.createdAt)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}