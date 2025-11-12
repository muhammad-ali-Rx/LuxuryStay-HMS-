"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  Calendar,
  Utensils
} from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    partySize: 2,
    specialRequests: "",
    occasion: "none"
  })

  useEffect(() => {
    fetchRestaurant()
  }, [id])

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/restaurants/${id}`)
      setRestaurant(response.data.data || response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching restaurant:", error)
      setLoading(false)
    }
  }

  const handleReservationSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post("http://localhost:3000/api/reservations", {
        restaurantId: id,
        ...reservationData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      alert("Reservation created successfully!")
      setShowReservationModal(false)
      navigate('/my-reservations')
    } catch (error) {
      console.error("Error creating reservation:", error)
      alert("Failed to create reservation. Please try again.")
    }
  }

  const getOperatingHours = (day) => {
    if (!restaurant?.openingHours?.[day]) return "Closed"
    const { open, close } = restaurant.openingHours[day]
    return open && close ? `${open} - ${close}` : "Closed"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <button 
            onClick={() => navigate("/restaurants")}
            className="bg-[#D4AF37] text-[#0A1F44] px-6 py-2 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate("/restaurants")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Restaurants
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={restaurant.images?.[0] || "/api/placeholder/1200/400"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4">
            <span className="bg-[#D4AF37] text-[#0A1F44] px-3 py-1 rounded-full font-semibold">
              {restaurant.cuisine}
            </span>
            <div className="flex items-center gap-1">
              <Star size={20} className="fill-current" />
              <span className="text-lg font-semibold">{restaurant.rating}</span>
              <span className="text-gray-300">({restaurant.totalRatings} reviews)</span>
            </div>
            <span className="text-lg font-semibold">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            </motion.section>

            {/* Chef Information */}
            {restaurant.chef && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm mb-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Our Chef</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <Utensils size={24} className="text-[#0A1F44]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{restaurant.chef.name}</h3>
                    <p className="text-[#D4AF37] font-medium">{restaurant.chef.specialty}</p>
                    <p className="text-gray-600 mt-1">{restaurant.chef.bio}</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Operating Hours */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Operating Hours</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700 capitalize">{day}</span>
                    <span className="text-gray-600">{getOperatingHours(day)}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-6"
            >
              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={20} className="text-[#D4AF37]" />
                  <span>{restaurant.location}</span>
                </div>
                
                {restaurant.contact?.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={20} className="text-[#D4AF37]" />
                    <span>{restaurant.contact.phone}</span>
                  </div>
                )}
                
                {restaurant.contact?.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={20} className="text-[#D4AF37]" />
                    <span>{restaurant.contact.email}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                {restaurant.features?.hasOutdoorSeating && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    <span>Outdoor Seating</span>
                  </div>
                )}
                {restaurant.features?.hasPrivateDining && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    <span>Private Dining</span>
                  </div>
                )}
                {restaurant.features?.hasWifi && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    <span>Free WiFi</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowReservationModal(true)}
                className="w-full bg-[#D4AF37] text-[#0A1F44] py-3 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Make Reservation
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Make Reservation</h2>
            
            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={reservationData.date}
                  onChange={(e) => setReservationData({...reservationData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={reservationData.time}
                  onChange={(e) => setReservationData({...reservationData, time: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
                <select
                  value={reservationData.partySize}
                  onChange={(e) => setReservationData({...reservationData, partySize: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(size => (
                    <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                <select
                  value={reservationData.occasion}
                  onChange={(e) => setReservationData({...reservationData, occasion: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="none">No special occasion</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="business">Business</option>
                  <option value="celebration">Celebration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  rows={3}
                  value={reservationData.specialRequests}
                  onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Any special requirements or requests..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D4AF37] text-[#0A1F44] py-2 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors"
                >
                  Confirm Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDetailPage