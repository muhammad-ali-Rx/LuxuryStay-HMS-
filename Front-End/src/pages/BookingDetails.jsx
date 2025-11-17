"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  CreditCard, 
  FileText, 
  ArrowLeft,
  Printer,
  Download,
  Mail,
  Phone,
  User,
  Shield,
  Star,
  DollarSign
} from "lucide-react"
import FrontendNavbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/UI/button"

const API_BASE_URL = "http://localhost:3000/booking"

export default function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { userAuth, isAuthenticated, getToken } = useAuth()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Check if booking data was passed via navigation state
  useEffect(() => {
    if (location.state?.booking) {
      setBooking(location.state.booking)
      setLoading(false)
    } else {
      fetchBookingDetails()
    }
  }, [id, location.state])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch booking details')
      }

      const result = await response.json()
      
      if (result.success) {
        setBooking(result.data)
      } else {
        throw new Error(result.message || "Failed to load booking details")
      }
      
    } catch (error) {
      console.error("❌ Error fetching booking details:", error)
      setError(error.message || "Failed to load booking details")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a printable version of the booking details
    const printContent = document.getElementById('booking-details-content').innerHTML
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmation - ${booking?._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(windowContent)
    printWindow.document.close()
    printWindow.print()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <Shield className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "cancelled":
        return <Shield className="w-5 h-5 text-red-600" />
      case "checked-in":
        return <User className="w-5 h-5 text-blue-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <FrontendNavbar />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please login to view booking details</p>
            <Button onClick={() => navigate('/login')}>
              Login Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <FrontendNavbar />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white">
        <FrontendNavbar />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
              <p className="text-red-600">{error || "Booking not found"}</p>
            </div>
            <Button onClick={() => navigate('/reservations')}>
              Back to My Bookings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate)

  return (
    <div className="min-h-screen bg-gray-50">
      <FrontendNavbar />

      {/* Header */}
      <div className="pt-32 pb-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/reservations')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Bookings
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-gray-600">Booking ID: {booking._id}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                  {getStatusIcon(booking.bookingStatus || booking.status)}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(booking.bookingStatus || booking.status)}`}>
                  {booking.bookingStatus || booking.status}
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "overview" 
                      ? "bg-[#0A1F44] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("guest")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "guest" 
                      ? "bg-[#0A1F44] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Guest Details
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "payment" 
                      ? "bg-[#0A1F44] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Payment Info
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "timeline" 
                      ? "bg-[#0A1F44] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Timeline
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div id="booking-details-content" className="bg-white rounded-lg shadow-sm border">
              
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Overview</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Room Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#D4AF37]" />
                          Room Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Room Type</span>
                            <span className="font-semibold">{booking.roomType || "Deluxe Room"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Room Number</span>
                            <span className="font-semibold">{booking.roomNumber || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guests</span>
                            <span className="font-semibold">{booking.numberOfGuests} Guests</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[#D4AF37]" />
                          Dates & Duration
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-in</span>
                            <span className="font-semibold">{formatDate(booking.checkInDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out</span>
                            <span className="font-semibold">{formatDate(booking.checkOutDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-semibold">{nights} Nights</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                        Price Summary
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Price</span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {booking.totalAmount / nights || 0}/night
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nights</span>
                          <span className="flex items-center gap-1">
                            {nights} × <DollarSign size={14} />
                            {booking.totalAmount / nights || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Taxes & Fees (18%)</span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            {Math.round(booking.totalAmount * 0.18)}
                          </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                          <span>Total Amount</span>
                          <span className="text-[#D4AF37] flex items-center gap-1">
                            <DollarSign size={18} />
                            {booking.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Payment Status</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#D4AF37]" />
                        Special Requests
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Details Tab */}
              {activeTab === "guest" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Details</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Guest</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-semibold">{userAuth?.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="font-semibold">{userAuth?.email || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone</span>
                            <span className="font-semibold">{userAuth?.phone || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-5 h-5" />
                          <span>{userAuth?.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-5 h-5" />
                          <span>{userAuth?.phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info Tab */}
              {activeTab === "payment" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-semibold flex items-center gap-1">
                              <DollarSign size={16} />
                              {booking.totalAmount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status</span>
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                              booking.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.paymentStatus || 'pending'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-semibold">{booking.payment?.method || 'Credit Card'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                          For any payment-related queries, please contact our support team.
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">+1-234-567-8900</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-700">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">support@luxurystay.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Timeline</h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                        <div className="w-0.5 h-16 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Booking Created</h3>
                        <p className="text-gray-600 text-sm">{formatDateTime(booking.createdAt)}</p>
                        <p className="text-gray-500 mt-1">Your booking request was submitted</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="w-0.5 h-16 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Confirmation</h3>
                        <p className="text-gray-600 text-sm">
                          {booking.bookingStatus === 'confirmed' ? formatDateTime(booking.updatedAt) : 'Pending'}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {booking.bookingStatus === 'confirmed' 
                            ? 'Your booking has been confirmed' 
                            : 'Waiting for confirmation from hotel'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.bookingStatus === 'checked-in' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="w-0.5 h-16 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Check-in</h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(booking.checkInDate)}
                        </p>
                        <p className="text-gray-500 mt-1">Scheduled check-in date</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.bookingStatus === 'checked-out' ? 'bg-purple-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Check-out</h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(booking.checkOutDate)}
                        </p>
                        <p className="text-gray-500 mt-1">Scheduled check-out date</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}