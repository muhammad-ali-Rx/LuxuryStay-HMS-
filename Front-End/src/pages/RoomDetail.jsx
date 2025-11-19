"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Star, Users, MapPin, Wifi, Coffee, Wind, Tv, ChevronLeft, ChevronRight, Loader, Heart, Share2, Bed, Bath, Square, DollarSign } from "lucide-react"
import { Button } from "../components/UI/button"

export default function RoomDetail() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    // Generate or get user ID
    const generatedUserId = generateUserId();
    setUserId(generatedUserId);
    fetchRoomDetails(generatedUserId);
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckInDate(today.toISOString().split('T')[0]);
    setCheckOutDate(tomorrow.toISOString().split('T')[0]);
  }, [id])

  // Generate unique user ID
  const generateUserId = () => {
    let storedUserId = localStorage.getItem('hotelUserID');
    
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('hotelUserID', storedUserId);
    }
    
    return storedUserId;
  }

  // Auto-slide functionality
  useEffect(() => {
    if (!room?.images?.length || !isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [room?.images?.length, isAutoPlaying])

  const fetchRoomDetails = async (userId) => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch room details
      const roomResponse = await fetch(`http://localhost:3000/room/show/${id}`)
      
      if (!roomResponse.ok) {
        throw new Error(`Failed to fetch room: ${roomResponse.status}`)
      }
      
      const roomData = await roomResponse.json()
      
      // Fetch user's previous rating
      const ratingResponse = await fetch(`http://localhost:3000/room/${id}/rating?userId=${userId}`)
      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        setUserRating(ratingData.data?.userRating || 0);
      }

      setRoom(roomData)
    } catch (err) {
      console.error("Error fetching room:", err)
      setError("Failed to load room details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Parse amenities from the database format
  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return []

    if (Array.isArray(amenitiesData) && amenitiesData.every((a) => typeof a === "string")) {
      return amenitiesData.filter((a) => a && a.trim())
    }

    if (typeof amenitiesData === "string") {
      try {
        const parsed = JSON.parse(amenitiesData)
        if (typeof parsed === "string") {
          return JSON.parse(parsed).filter((a) => a && a.trim())
        }
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => a && a.trim())
        }
      } catch (e) {
        return [amenitiesData].filter((a) => a && a.trim())
      }
    }

    return []
  }

  // Map amenity names to icons
  const getAmenityIcon = (amenityName) => {
    const iconMap = {
      'WiFi': Wifi,
      'TV': Tv,
      'AC': Wind,
      'Air Conditioning': Wind,
      'Coffee Maker': Coffee,
      'Mini Fridge': Coffee,
      'Hot Water': Coffee,
      'Bathtub': Bath,
      'Gym Access': Users,
      'Pool Access': Users,
      'Room Service': Users
    }
    
    return iconMap[amenityName] || Coffee
  }

  const nextImage = () => {
    if (room?.images?.length) {
      setIsAutoPlaying(false)
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room?.images?.length) {
      setIsAutoPlaying(false)
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  const goToImage = (index) => {
    setIsAutoPlaying(false)
    setCurrentImageIndex(index)
  }

  // Rating Functions
  const submitRating = async (rating) => {
    if (userRating > 0) {
      alert("You have already rated this room!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/room/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          rating: rating
        })
      });

      const result = await response.json();

      if (response.ok) {
        setRoom(prev => ({
          ...prev,
          rating: result.data.rating,
          totalRatings: result.data.totalRatings,
          ratingCounts: result.data.ratingCounts
        }));
        setUserRating(rating);
        alert(`Thanks for your ${rating} star rating!`);
      } else {
        if (result.message.includes("already rated")) {
          setUserRating(result.data?.userRating || rating);
          alert("You have already rated this room!");
        } else {
          alert(result.message || "Failed to submit rating");
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (star) => {
    if (!room?.ratingCounts || room.totalRatings === 0) return 0;
    return ((room.ratingCounts[star] || 0) / room.totalRatings) * 100;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return room?.pricePerNight || 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return (room?.pricePerNight || 0) * (nights > 0 ? nights : 1);
  };

  const getNightsCount = () => {
    if (!checkInDate || !checkOutDate) return 1;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights : 1;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="pt-32 pb-12 px-4 text-center flex justify-center items-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-12 w-12 animate-spin text-[#1D293D]" />
            <p className="text-gray-600 text-lg font-medium">Loading room details...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="pt-32 pb-12 px-4 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Room Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg">{error || "The room you're looking for doesn't exist."}</p>
            <Link to="/rooms">
              <Button className="bg-[#1D293D] hover:bg-[#2D3B5D] text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Back to Rooms
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const amenities = parseAmenities(room.amenities)
  const roomImages = room.images && room.images.length > 0 ? room.images : ["/placeholder.svg"]
  const totalPrice = calculateTotalPrice()
  const nights = getNightsCount()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      {/* Enhanced Image Gallery */}
      <div 
        className="relative w-full h-96 md:h-[70vh] bg-gray-200 pt-20 overflow-hidden group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Main Image with Smooth Transition */}
        <div className="relative w-full h-full">
          {roomImages.map((image, index) => (
            <img
              key={index}
              src={image || "/placeholder.svg"}
              alt={`Room ${room.roomNumber} - Image ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                index === currentImageIndex 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-105"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons with Hover Effects */}
        {roomImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={28} className="hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={28} className="hover:scale-110 transition-transform" />
            </button>

            {/* Enhanced Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentImageIndex + 1} / {roomImages.length}
            </div>

            {/* Image Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {roomImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Enhanced Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Header */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Room #{room.roomNumber} - {room.roomType}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {room.description || `Experience comfort and luxury in our ${room.roomType} room.`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                    <Share2 size={18} />
                    Share
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                    <Heart size={18} />
                    Save
                  </Button>
                </div>
              </div>

              {/* Enhanced Rating Section */}
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                {/* Average Rating */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#1D293D]">{room.rating || 0}</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(room.rating || 0) ? "fill-[#E2BD3A] text-[#E2BD3A]" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {room.totalRatings || 0} {room.totalRatings === 1 ? 'rating' : 'ratings'}
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 max-w-md">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-4">{star}</span>
                        <Star size={16} className="fill-[#E2BD3A] text-[#E2BD3A]" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#E2BD3A] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getPercentage(star)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          ({room.ratingCounts ? room.ratingCounts[star] || 0 : 0})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rate This Room */}
                <div className="border-l border-gray-200 pl-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {userRating > 0 ? "Your Rating" : "Rate this room"}
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => submitRating(star)}
                          onMouseEnter={() => userRating === 0 && setHoverRating(star)}
                          onMouseLeave={() => userRating === 0 && setHoverRating(0)}
                          disabled={isSubmitting || userRating > 0}
                          className={`text-2xl transition-transform duration-200 focus:outline-none ${
                            userRating > 0 ? 'cursor-default' : 'hover:scale-110'
                          } ${(isSubmitting || userRating > 0) ? 'opacity-50' : ''}`}
                        >
                          <span className={
                            star <= (userRating || hoverRating) 
                              ? "text-[#E2BD3A]" 
                              : "text-gray-300"
                          }>
                            ⭐
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userRating > 0 ? (
                        <span className="text-green-600 font-medium">
                          You rated this {userRating} star{userRating > 1 ? 's' : ''}
                        </span>
                      ) : hoverRating > 0 ? (
                        <span>Rate {hoverRating} star{hoverRating > 1 ? 's' : ''}</span>
                      ) : (
                        <span>Click to rate this room</span>
                      )}
                    </div>
                    {userRating > 0 && (
                      <div className="text-xs text-gray-500">
                        You can only rate once per room
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Specifications */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Room Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="text-teal-600" size={28} />
                  </div>
                  <p className="font-semibold text-gray-900">Capacity</p>
                  <p className="text-gray-600">{room.capacity || 2} Guests</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bed className="text-blue-600" size={28} />
                  </div>
                  <p className="font-semibold text-gray-900">Bed Type</p>
                  <p className="text-gray-600">{room.bedType || "Double"}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Square className="text-green-600" size={28} />
                  </div>
                  <p className="font-semibold text-gray-900">Room Size</p>
                  <p className="text-gray-600">{room.size || "45 sqm"}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="text-purple-600" size={28} />
                  </div>
                  <p className="font-semibold text-gray-900">View</p>
                  <p className="text-gray-600">{room.view || "City"}</p>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.length > 0 ? (
                  amenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity)
                    return (
                      <div key={amenity} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                        <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Icon size={24} className="text-[#1B3788]" />
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">{amenity}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tv className="text-gray-400" size={28} />
                    </div>
                    <p className="text-lg">No amenities listed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Room Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-200">
                    <span className="text-[#1B3788] text-xl font-bold transition-transform group-hover:scale-110">✓</span>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium">{amenity}</span>
                  </div>
                ))}
                {!room.description && (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-200">
                      <span className="text-[#1B3788] text-xl font-bold transition-transform group-hover:scale-110">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">Comfortable {room.capacity > 2 ? 'multiple beds' : 'king-size bed'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-200">
                      <span className="text-[#1B3788] text-xl font-bold transition-transform group-hover:scale-110">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">Private bathroom with premium toiletries</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-200">
                      <span className="text-[#1B3788] text-xl font-bold transition-transform group-hover:scale-110">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">Daily housekeeping service</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-200">
                      <span className="text-[#1B3788] text-xl font-bold transition-transform group-hover:scale-110">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">24/7 room service available</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 sticky top-24 shadow-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 text-center">
                <p className="text-gray-600 text-sm mb-2">Starting from</p>
                <p className="text-5xl font-bold text-[#1D293D] flex items-center justify-center gap-1 mb-2">
                  <DollarSign size={32} />
                  {room.pricePerNight}
                </p>
                <p className="text-gray-500 text-sm">per night</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#1D293D] transition-colors">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Check-in</p>
                  <input 
                    type="date" 
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-gray-900 font-medium" 
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#1D293D] transition-colors">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Check-out</p>
                  <input 
                    type="date" 
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-gray-900 font-medium" 
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#1D293D] transition-colors">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Guests</p>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full bg-transparent border-none focus:outline-none text-gray-900 font-medium"
                  >
                    {[...Array(room.capacity || 2)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <DollarSign size={12} />
                      {room.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <DollarSign size={12} />
                      {room.pricePerNight * nights}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium flex items-center gap-1">
                      <DollarSign size={12} />
                      0
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-[#1D293D] flex items-center gap-1">
                        <DollarSign size={16} />
                        {totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to={`/booking?roomId=${room._id}&roomNumber=${room.roomNumber}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`} 
                className="block w-full"
              >
                <Button 
                  className={`w-full mb-4 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    room.status !== 'Vacant' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#1D293D] hover:bg-[#2D3B5D] text-white'
                  }`}
                  disabled={room.status !== 'Vacant'}
                >
                  {room.status === 'Vacant' ? 'Book Now' : `Room ${room.status}`}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full py-4 text-lg font-semibold rounded-xl border-2 border-[#1D293D] hover:bg-[#1D293D] hover:text-white text-[#1D293D] transition-all duration-300"
              >
                <Heart size={20} className="mr-2" />
                Add to Wishlist
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="text-blue-500">✓</span>
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="text-purple-500">✓</span>
                    <span>Best price guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}