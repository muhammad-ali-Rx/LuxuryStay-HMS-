"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Star, Clock, Users, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const RestaurantListingPage = () => {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    cuisine: "all",
    priceRange: "all",
    rating: "all"
  })

  const cuisines = ["all", "French", "Italian", "Japanese", "Indian", "International", "Mexican", "Chinese"]
  const priceRanges = ["all", "$", "$$", "$$$", "$$$$"]
  const ratings = ["all", "4.5", "4.0", "3.5", "3.0"]

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    filterRestaurants()
  }, [searchTerm, filters, restaurants])

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/restaurants")
      setRestaurants(response.data.data || response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      setLoading(false)
    }
  }

  const filterRestaurants = () => {
    let filtered = restaurants

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Cuisine filter
    if (filters.cuisine !== "all") {
      filtered = filtered.filter(restaurant => restaurant.cuisine === filters.cuisine)
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(restaurant => restaurant.priceRange === filters.priceRange)
    }

    // Rating filter
    if (filters.rating !== "all") {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(restaurant => restaurant.rating >= minRating)
    }

    setFilteredRestaurants(filtered)
  }

  const getPriceRangeText = (priceRange) => {
    const ranges = {
      "$": "Budget",
      "$$": "Moderate", 
      "$$$": "Expensive",
      "$$$$": "Luxury"
    }
    return ranges[priceRange] || priceRange
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A1F44] to-[#1a365d] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            Culinary Excellence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Discover world-class dining experiences crafted by our award-winning chefs
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === "all" ? "All Cuisines" : cuisine}
                  </option>
                ))}
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range} value={range}>
                    {range === "all" ? "All Prices" : getPriceRangeText(range)}
                  </option>
                ))}
              </select>

              <select
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === "all" ? "All Ratings" : `${rating}+ Stars`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Restaurants {filteredRestaurants.length > 0 && `(${filteredRestaurants.length})`}
            </h2>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <p className="text-xl text-gray-600">No restaurants found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.images?.[0] || "/api/placeholder/400/300"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold text-gray-900">{restaurant.priceRange}</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#D4AF37] text-[#0A1F44] px-2 py-1 rounded-full text-sm font-semibold">
                        {restaurant.cuisine}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#D4AF37]/10 px-2 py-1 rounded-full">
                        <Star size={16} className="text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="text-sm font-semibold text-gray-900">{restaurant.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin size={16} />
                      <span>{restaurant.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{restaurant.openingHours?.monday?.open} - {restaurant.openingHours?.monday?.close}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>Up to {restaurant.capacity} guests</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {restaurant.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default RestaurantListingPage  