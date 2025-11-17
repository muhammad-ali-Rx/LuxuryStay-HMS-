"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Star, Clock, Users, MapPin, Calendar, ChevronDown, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const RestaurantListingPage = () => {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [reservationForm, setReservationForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    reservationDate: "",
    reservationTime: "",
    partySize: 1,
    specialRequests: "",
    occasion: "none"
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    cuisine: "all",
    rating: "all",
    sortBy: "name"
  })

  const cuisines = ["all", "French", "Italian", "Japanese", "Indian", "International", "Mexican", "Chinese"]
  const ratings = ["all", "4.5", "4.0", "3.5", "3.0"]
  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "rating", label: "Highest Rated" },
    { value: "capacity", label: "Largest Capacity" }
  ]

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    filterAndSortRestaurants()
  }, [searchTerm, restaurants, activeFilters])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:3000/restaurants")
      setRestaurants(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      setError("Failed to load restaurants. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRestaurants = () => {
    let filtered = [...restaurants]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Cuisine filter
    if (activeFilters.cuisine !== "all") {
      filtered = filtered.filter(restaurant => restaurant.cuisine === activeFilters.cuisine)
    }

    // Rating filter
    if (activeFilters.rating !== "all") {
      const minRating = parseFloat(activeFilters.rating)
      filtered = filtered.filter(restaurant => restaurant.rating >= minRating)
    }

    // Sort restaurants
    switch (activeFilters.sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "capacity":
        filtered.sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        break
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredRestaurants(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setActiveFilters({
      cuisine: "all",
      rating: "all",
      sortBy: "name"
    })
    setSearchTerm("")
  }

  const openReservationModal = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowReservationModal(true)
    setError("")
    setSuccess("")
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0]
    setReservationForm(prev => ({
      ...prev,
      reservationDate: today
    }))
  }

  const closeReservationModal = () => {
    setShowReservationModal(false)
    setSelectedRestaurant(null)
    setReservationForm({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      reservationDate: "",
      reservationTime: "",
      partySize: 1,
      specialRequests: "",
      occasion: "none"
    })
  }

  const createReservation = async (e) => {
    e.preventDefault()
    try {
      setError("")
      
      // Basic validation
      if (!reservationForm.guestName.trim()) {
        setError("Please enter your name")
        return
      }
      if (!reservationForm.guestEmail.trim()) {
        setError("Please enter your email")
        return
      }
      if (!reservationForm.guestPhone.trim()) {
        setError("Please enter your phone number")
        return
      }
      if (!reservationForm.reservationDate) {
        setError("Please select a date")
        return
      }
      if (!reservationForm.reservationTime) {
        setError("Please select a time")
        return
      }

      const response = await axios.post(
        "http://localhost:3000/reservations/create", 
        {
          restaurantId: selectedRestaurant._id,
          ...reservationForm
        }
      )

      setSuccess("Reservation created successfully!")
      setTimeout(() => {
        closeReservationModal()
        setSuccess("")
      }, 2000)
      
    } catch (error) {
      console.error("Error creating reservation:", error)
      setError(error.response?.data?.message || "Error creating reservation. Please try again.")
    }
  }

  const occasions = [
    "none",
    "birthday",
    "anniversary", 
    "business",
    "celebration",
    "romantic",
    "family"
  ]

  const hasActiveFilters = activeFilters.cuisine !== "all" || activeFilters.rating !== "all" || searchTerm

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#1a365d] to-[#2D4B85] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            Culinary Excellence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
          >
            Discover world-class dining experiences crafted by our award-winning chefs
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] bg-white shadow-sm transition-all duration-200 text-lg"
                />
              </div>
            </div>

            {/* Filter Toggle for Mobile */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
              >
                <Filter size={20} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={activeFilters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-medium cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-6 overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <select
                    value={activeFilters.cuisine}
                    onChange={(e) => handleFilterChange("cuisine", e.target.value)}
                    className="flex-1 min-w-[150px] border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    {cuisines.map(cuisine => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine === "all" ? "All Cuisines" : cuisine}
                      </option>
                    ))}
                  </select>

                  <select
                    value={activeFilters.rating}
                    onChange={(e) => handleFilterChange("rating", e.target.value)}
                    className="flex-1 min-w-[150px] border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>
                        {rating === "all" ? "All Ratings" : `${rating}+ Stars`}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filters */}
          <div className="hidden lg:flex flex-wrap gap-4 mt-6 items-center">
            <select
              value={activeFilters.cuisine}
              onChange={(e) => handleFilterChange("cuisine", e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-medium"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine === "all" ? "All Cuisines" : cuisine}
                </option>
              ))}
            </select>

            <select
              value={activeFilters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-medium"
            >
              {ratings.map(rating => (
                <option key={rating} value={rating}>
                  {rating === "all" ? "All Ratings" : `${rating}+ Stars`}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Restaurants
              </h2>
              {!loading && (
                <p className="text-gray-600 mt-2">
                  {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                  {hasActiveFilters && " matching your criteria"}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            // Enhanced Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF37] border-t-transparent mb-6"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-transparent"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Discovering Culinary Gems</h3>
              <p className="text-gray-600 text-center max-w-md">
                We're gathering the finest dining experiences just for you...
              </p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            // Enhanced No Results State
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No restaurants found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search terms to find more options."
                  : "We're constantly adding new restaurants. Check back soon!"
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-[#D4AF37] text-[#0A1F44] px-8 py-3 rounded-xl font-semibold hover:bg-[#c19b2a] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            // Enhanced Restaurants Grid
            <motion.div 
              layout
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  className="group cursor-pointer"
                >
                  <div 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={restaurant.images?.[0] || "/api/placeholder/400/300"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Premium Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0A1F44] px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-sm font-bold">FREE</span>
                      </div>
                      
                      {/* Cuisine Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                          {restaurant.cuisine}
                        </span>
                      </div>

                      {/* Rating Overlay */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="text-sm font-semibold">{restaurant.rating || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                          {restaurant.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {restaurant.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <MapPin size={16} className="text-[#D4AF37]" />
                        <span className="line-clamp-1">{restaurant.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-[#D4AF37]" />
                          <span>Today: {restaurant.openingHours?.monday?.open} - {restaurant.openingHours?.monday?.close}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#D4AF37]" />
                          <span>Up to {restaurant.capacity}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {restaurant.tags && restaurant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {restaurant.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reserve Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openReservationModal(restaurant)
                        }}
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0A1F44] py-3.5 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 group/btn"
                      >
                        <Calendar size={18} className="group-hover/btn:scale-110 transition-transform" />
                        Reserve Now - Free
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Reservation Modal */}
      <AnimatePresence>
        {showReservationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Make Reservation
                  </h2>
                  <button
                    onClick={closeReservationModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <X size={24} />
                  </button>
                </div>

                {selectedRestaurant && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 text-lg">{selectedRestaurant.name}</h3>
                    <p className="text-blue-700">{selectedRestaurant.cuisine} • {selectedRestaurant.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-blue-600">Capacity: {selectedRestaurant.capacity} seats</span>
                      <span className="text-green-600 font-semibold">✓ Free Reservation</span>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6"
                  >
                    {success}
                  </motion.div>
                )}

                <form onSubmit={createReservation} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reservationForm.guestName}
                      onChange={(e) => setReservationForm({...reservationForm, guestName: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={reservationForm.guestEmail}
                        onChange={(e) => setReservationForm({...reservationForm, guestEmail: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={reservationForm.guestPhone}
                        onChange={(e) => setReservationForm({...reservationForm, guestPhone: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={reservationForm.reservationDate}
                        onChange={(e) => setReservationForm({...reservationForm, reservationDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={reservationForm.reservationTime}
                        onChange={(e) => setReservationForm({...reservationForm, reservationTime: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Party Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={reservationForm.partySize}
                      onChange={(e) => setReservationForm({...reservationForm, partySize: parseInt(e.target.value) || 1})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Occasion
                    </label>
                    <select
                      value={reservationForm.occasion}
                      onChange={(e) => setReservationForm({...reservationForm, occasion: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200"
                    >
                      {occasions.map((occasion) => (
                        <option key={occasion} value={occasion}>
                          {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      rows={3}
                      value={reservationForm.specialRequests}
                      onChange={(e) => setReservationForm({...reservationForm, specialRequests: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all duration-200 resize-none"
                      placeholder="Any dietary restrictions, allergies, or special requirements..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0A1F44] px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Confirm Reservation
                    </button>
                    <button
                      type="button"
                      onClick={closeReservationModal}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default RestaurantListingPage