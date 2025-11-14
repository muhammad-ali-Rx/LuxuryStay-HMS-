"use client"

import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function RoomHighlights() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:3000/room/show")
      const roomsData = response.data.data || response.data
      
      console.log("Raw API Response:", roomsData) // Debug log

      // Transform API data to match component structure
      const transformedRooms = await Promise.all(
        roomsData.map(async (room) => {
          let roomRating = room.rating || 4.5
          
          // Fetch individual room rating if userId is available
          try {
            const userId = localStorage.getItem('userId')
            if (userId && room._id) {
              const ratingResponse = await axios.get(`http://localhost:3000/room/${room._id}/rating?userId=${userId}`)
              if (ratingResponse.data && ratingResponse.data.rating) {
                roomRating = ratingResponse.data.rating
              }
            }
          } catch (ratingError) {
            console.warn(`Could not fetch rating for room ${room._id}:`, ratingError)
          }

          // Use pricePerNight from your model instead of price
          let roomPrice = room.pricePerNight || 0

          // If price is still 0, set default prices based on room type
          if (roomPrice === 0) {
            const defaultPrices = {
              'deluxe': 3000,
              'premium': 5000,
              'suite': 8000,
              'presidential': 15000,
              'penthouse': 20000,
              'family': 6000,
              'twin': 3500,
              'single': 2500,
              'double': 3000,
              'standard': 2000
            }
            
            const roomType = room.roomType?.toLowerCase() || room.name?.toLowerCase() || ''
            for (const [key, price] of Object.entries(defaultPrices)) {
              if (roomType.includes(key)) {
                roomPrice = price
                break
              }
            }
            
            // If no match found, set a reasonable default
            if (roomPrice === 0) {
              roomPrice = 3500
            }
          }

          return {
            id: room._id,
            name: room.roomType || `Room ${room.roomNumber || room._id}`, // Use roomType as name
            price: roomPrice,
            rating: roomRating,
            image: room.images?.[0] || "/placeholder.svg",
            type: room.roomType, // Use roomType from model
            description: room.description,
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            amenities: room.amenities,
            allImages: room.images || [],
            // Keep original data for debugging
            originalData: room
          }
        })
      )
      
      setRooms(transformedRooms)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError("Failed to load rooms")
      setLoading(false)
    }
  }

  const handleImageError = (e, roomId) => {
    console.warn(`Image failed to load for room ${roomId}`)
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3ERoom Image%3C/text%3E%3C/svg%3E"
  }

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Signature Rooms</h2>
            <p className="text-lg text-gray-600">Handpicked luxury accommodations for your perfect stay</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3788]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Signature Rooms</h2>
            <p className="text-lg text-gray-600">Handpicked luxury accommodations for your perfect stay</p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchRooms}
              className="bg-[#1B3788] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Signature Rooms</h2>
          <p className="text-lg text-gray-600">Handpicked luxury accommodations for your perfect stay</p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No rooms available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rooms.map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`}>
                <div className="group cursor-pointer h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => handleImageError(e, room.id)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="bg-[#1B3788] text-white px-4 py-2 rounded-lg font-semibold w-full text-center hover:bg-blue-800 transition-colors">
                        View Details
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{room.rating.toFixed(1)}</span>
                    </div>

                    {/* Room Number Badge */}
                    <div className="absolute top-3 left-3 bg-[#1B3788] text-white px-2 py-1 rounded-lg text-sm font-semibold">
                      {room.roomNumber}
                    </div>
                  </div>
                  
                  {/* Room Info */}
                  <div className="p-6">
                    {/* Room Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1B3788] transition-colors duration-300">
                      {room.name}
                    </h3>
                    
                    {/* Capacity */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <span>👤 {room.capacity} Guests</span>
                    </div>
                    
                    {/* Price and Rating */}
                    <div className="flex justify-between items-center">
                      {/* Price - Blue Theme */}
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#1B3788]">
                          {formatPrice(room.price)}
                        </span>
                        <span className="text-gray-500 text-sm">per night</span>
                      </div>
                      
                      {/* Rating - Blue Theme */}
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <Star size={18} className="fill-[#1B3788] text-[#1B3788]" />
                        <span className="font-bold text-[#1B3788]">{room.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Description (optional) */}
                    {room.description && (
                      <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                    
                    {/* Amenities (limited display) */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}