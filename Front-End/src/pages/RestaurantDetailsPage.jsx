"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  Wifi,
  Car,
  Accessibility,
  Utensils,
  ExternalLink,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Shield,
  CheckCircle,
  Sparkles,
  Crown,
  Award,
  ChefHat,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const RestaurantDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showImageModal, setShowImageModal] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  
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

  // Static menu data
  const menuSections = [
    {
      title: "Appetizers",
      items: [
        { name: "Truffle Arancini", price: "$18", description: "Crispy risotto balls with black truffle and parmesan" },
        { name: "Beef Tartare", price: "$22", description: "Premium beef with capers, shallots, and quail egg" },
        { name: "Lobster Bisque", price: "$16", description: "Creamy lobster soup with cognac and fresh herbs" },
        { name: "Burrata Caprese", price: "$14", description: "Fresh burrata with heirloom tomatoes and basil oil" }
      ]
    },
    {
      title: "Main Courses",
      items: [
        { name: "Wagyu Ribeye", price: "$65", description: "8oz Japanese wagyu with roasted vegetables and red wine jus" },
        { name: "Truffle Pasta", price: "$32", description: "Handmade fettuccine with black truffle and wild mushrooms" },
        { name: "Atlantic Salmon", price: "$28", description: "Pan-seared salmon with lemon butter sauce and asparagus" },
        { name: "Duck Confit", price: "$34", description: "Slow-cooked duck leg with cherry reduction and potato gratin" }
      ]
    },
    {
      title: "Desserts",
      items: [
        { name: "Chocolate Soufflé", price: "$14", description: "Warm chocolate soufflé with vanilla bean ice cream" },
        { name: "Crème Brûlée", price: "$12", description: "Classic vanilla custard with caramelized sugar crust" },
        { name: "Tiramisu", price: "$10", description: "Traditional Italian dessert with espresso and mascarpone" },
        { name: "Seasonal Fruit Tart", price: "$11", description: "Fresh seasonal fruits with pastry cream and almond crust" }
      ]
    },
    {
      title: "Beverages",
      items: [
        { name: "Signature Cocktails", price: "$16", description: "Ask your server for today's special creations" },
        { name: "Wine Selection", price: "$12-$25", description: "Curated wines from around the world" },
        { name: "Craft Beers", price: "$8", description: "Local and international craft beer selection" },
        { name: "Non-Alcoholic", price: "$6", description: "Fresh juices, sodas, and specialty mocktails" }
      ]
    }
  ]

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails()
    }
  }, [id])

  useEffect(() => {
    let interval
    if (autoPlay && restaurant?.images?.length > 1 && !showImageModal) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === restaurant.images.length - 1 ? 0 : prev + 1
        )
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [autoPlay, restaurant?.images, showImageModal])

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:3000/restaurants/${id}`)
      const restaurantData = response.data.data || response.data
      
      const enhancedData = {
        ...restaurantData,
        popularity: Math.floor(Math.random() * 100) + 80,
        waitTime: Math.floor(Math.random() * 30) + 15,
        trending: Math.random() > 0.5
      }
      
      setRestaurant(enhancedData)
    } catch (error) {
      console.error("Error fetching restaurant details:", error)
      setError("Failed to load restaurant details")
    } finally {
      setLoading(false)
    }
  }

  // Simple Loading Screen with Navbar
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Animated Spinner */}
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-[#1D293D] border-t-transparent rounded-full mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Utensils className="text-[#1D293D]" size={24} />
            </div>
          </div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Discovering Culinary Excellence
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              We're preparing an unforgettable dining experience for you...
            </p>
          </motion.div>

          {/* Loading Dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-2 h-2 bg-[#1D293D] rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingScreen />
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Restaurant Not Found</h2>
            <button 
              onClick={() => navigate('/dining')}
              className="text-[#1D293D] hover:underline font-medium"
            >
              Back to Restaurants
            </button>
          </div>
        </div>
      </div>
    )
  }

  const openReservationModal = () => {
    setShowReservationModal(true)
    setError("")
    setSuccess("")
    const today = new Date().toISOString().split('T')[0]
    setReservationForm(prev => ({
      ...prev,
      reservationDate: today
    }))
  }

  const closeReservationModal = () => {
    setShowReservationModal(false)
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
        "http://localhost:3000/reservations", 
        {
          restaurantId: id,
          ...reservationForm
        }
      )

      setSuccess("Reservation created successfully! You'll receive a confirmation email shortly.")
      setTimeout(() => {
        closeReservationModal()
        setSuccess("")
      }, 3000)
      
    } catch (error) {
      console.error("Error creating reservation:", error)
      setError(error.response?.data?.message || "Error creating reservation. Please try again.")
    }
  }

  const nextImage = () => {
    if (restaurant.images) {
      setCurrentImageIndex(prev => 
        prev === restaurant.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (restaurant.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? restaurant.images.length - 1 : prev - 1
      )
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const shareRestaurant = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `Check out ${restaurant.name} - ${restaurant.cuisine} cuisine`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Sharing cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const openImageModal = () => {
    setShowImageModal(true)
    setAutoPlay(false)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setAutoPlay(true)
  }

  const formatOpeningHours = (openingHours) => {
    if (!openingHours) return []
    
    const days = [
      { name: "Monday", key: "monday" },
      { name: "Tuesday", key: "tuesday" },
      { name: "Wednesday", key: "wednesday" },
      { name: "Thursday", key: "thursday" },
      { name: "Friday", key: "friday" },
      { name: "Saturday", key: "saturday" },
      { name: "Sunday", key: "sunday" }
    ]
    
    return days.map(day => {
      const hours = openingHours[day.key]
      if (!hours || hours.closed) {
        return { ...day, hours: "Closed", isClosed: true }
      }
      return { ...day, hours: `${hours.open} - ${hours.close}`, isClosed: false }
    })
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

  const tabs = [
    { id: "overview", label: "Overview", icon: Utensils },
    { id: "menu", label: "Menu", icon: ChefHat },
    { id: "gallery", label: "Gallery", icon: Sparkles }
  ]

  const openingHours = formatOpeningHours(restaurant.openingHours)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/dining')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Restaurants</span>
        </button>
      </div>

      {/* Restaurant Header */}
      <section className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-200">
            {restaurant.images && restaurant.images.length > 0 ? (
              <>
                <img
                  src={restaurant.images[currentImageIndex]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {restaurant.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {restaurant.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Utensils size={64} className="text-gray-400" />
              </div>
            )}
            
            {/* Premium Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg">
              <span className="font-bold text-sm">FREE RESERVATION</span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </button>
              <button
                onClick={shareRestaurant}
                className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-300"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {restaurant.trending && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                      <Sparkles size={14} />
                      Trending
                    </span>
                  )}
                  <span className="bg-[#1D293D] text-white px-4 py-2 rounded-full text-sm font-bold">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center gap-1 bg-[#E2BD3A]/10 px-3 py-2 rounded-full">
                    <Star size={18} className="text-[#E2BD3A] fill-[#E2BD3A]" />
                    <span className="text-sm font-bold text-gray-900">
                      {restaurant.rating || "N/A"}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {restaurant.name}
                </h1>
                
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin size={20} className="text-[#1D293D]" />
                  <span className="text-lg">{restaurant.location}</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openReservationModal}
                className="bg-[#1D293D] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2D3B5D] shadow-lg transition-all duration-300 flex items-center gap-3"
              >
                <Calendar size={22} />
                Reserve Now
                <Zap size={18} />
              </motion.button>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-4xl">
              {restaurant.description}
            </p>

            {/* Enhanced Quick Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Users className="mx-auto mb-3 text-blue-600" size={28} />
                <div className="text-sm text-gray-600 font-medium">Capacity</div>
                <div className="font-bold text-gray-900 text-lg">{restaurant.capacity} guests</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                <Clock className="mx-auto mb-3 text-green-600" size={28} />
                <div className="text-sm text-gray-600 font-medium">Today's Hours</div>
                <div className="font-bold text-gray-900 text-lg">
                  {restaurant.openingHours?.monday?.closed 
                    ? "Closed" 
                    : `${restaurant.openingHours?.monday?.open} - ${restaurant.openingHours?.monday?.close}`
                  }
                </div>
              </div>
              
              {restaurant.contact?.phone && (
                <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <Phone className="mx-auto mb-3 text-purple-600" size={28} />
                  <div className="text-sm text-gray-600 font-medium">Phone</div>
                  <div className="font-bold text-gray-900 text-lg">{restaurant.contact.phone}</div>
                </div>
              )}
              
              {restaurant.contact?.email && (
                <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <Mail className="mx-auto mb-3 text-orange-600" size={28} />
                  <div className="text-sm text-gray-600 font-medium">Email</div>
                  <div className="font-bold text-gray-900 text-lg">{restaurant.contact.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#1D293D] text-[#1D293D] font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Features */}
                {restaurant.features && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Award className="text-[#1D293D]" size={28} />
                      Premium Amenities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {restaurant.features.hasWifi && (
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300">
                          <div className="p-3 bg-blue-500 rounded-lg">
                            <Wifi size={24} className="text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">High-Speed WiFi</span>
                            <p className="text-sm text-gray-600">Complimentary internet access</p>
                          </div>
                        </div>
                      )}
                      {restaurant.features.hasParking && (
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300">
                          <div className="p-3 bg-green-500 rounded-lg">
                            <Car size={24} className="text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Valet Parking</span>
                            <p className="text-sm text-gray-600">Complimentary valet service</p>
                          </div>
                        </div>
                      )}
                      {restaurant.features.isWheelchairAccessible && (
                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300">
                          <div className="p-3 bg-purple-500 rounded-lg">
                            <Accessibility size={24} className="text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Wheelchair Accessible</span>
                            <p className="text-sm text-gray-600">Fully accessible facilities</p>
                          </div>
                        </div>
                      )}
                      {restaurant.features.hasOutdoorSeating && (
                        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300">
                          <div className="p-3 bg-orange-500 rounded-lg">
                            <ExternalLink size={24} className="text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Outdoor Seating</span>
                            <p className="text-sm text-gray-600">Beautiful al fresco dining</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Opening Hours */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Clock className="text-[#1D293D]" size={28} />
                    Opening Hours
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {openingHours.map((day, index) => (
                      <div 
                        key={day.key} 
                        className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 ${
                          day.isClosed 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className={`font-semibold ${
                          day.isClosed ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {day.name}
                        </span>
                        <span className={`font-bold ${
                          day.isClosed ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {day.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === "menu" && (
              <div className="space-y-8">
                {menuSections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <ChefHat className="text-[#1D293D]" size={28} />
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                          className="flex justify-between items-start p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#1D293D] transition-all duration-300 group"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                              <span className="text-[#1D293D] font-bold text-lg">{item.price}</span>
                            </div>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {restaurant.images?.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setCurrentImageIndex(index)
                      openImageModal()
                    }}
                  >
                    <img
                      src={image}
                      alt={`${restaurant.name} ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Reserve Card */}
            <div className="bg-gradient-to-br from-[#1D293D] to-[#2D3B5D] text-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2BD3A]/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={20} className="text-[#E2BD3A]" />
                  <h3 className="text-xl font-bold">Premium Experience</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Secure your table at {restaurant.name} for an exceptional dining journey.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Reservation Fee</span>
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      <CheckCircle size={18} />
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Max Capacity</span>
                    <span className="font-semibold">{restaurant.capacity} guests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Instant Confirmation</span>
                    <Shield size={18} className="text-green-400" />
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openReservationModal}
                  className="w-full bg-[#E2BD3A] text-[#1D293D] py-4 rounded-xl font-bold hover:bg-[#d4ab2a] shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Calendar size={22} />
                  Reserve Instantly
                  <Zap size={18} />
                </motion.button>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Contact & Location</h3>
              <div className="space-y-3">
                {restaurant.contact?.phone && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer group">
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Phone size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{restaurant.contact.phone}</span>
                  </div>
                )}
                {restaurant.contact?.email && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer group">
                    <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{restaurant.contact.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer group">
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{restaurant.location}</span>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {restaurant.tags && restaurant.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Culinary Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold border border-gray-300 hover:border-[#1D293D] transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rest of the component (Image Modal and Reservation Modal) remains the same */}
      {/* ... */}

      <Footer />
    </div>
  )
}

export default RestaurantDetailsPage