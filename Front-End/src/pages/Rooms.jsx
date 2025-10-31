"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Star, Users } from "lucide-react"
import { Button } from "../components/UI/button"

const allRooms = [
  {
    id: 1,
    name: "Deluxe Suite",
    price: 450,
    rating: 4.8,
    reviews: 128,
    image: "/luxury-deluxe-suite.jpg",
    description: "Spacious suite with premium amenities and city views",
    capacity: 2,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "45 sqm",
  },
  {
    id: 2,
    name: "Presidential Suite",
    price: 850,
    rating: 4.9,
    reviews: 95,
    image: "/luxury-presidential-suite.jpg",
    description: "Ultimate luxury with separate living area and premium service",
    capacity: 4,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "85 sqm",
  },
  {
    id: 3,
    name: "Ocean View Suite",
    price: 650,
    rating: 4.7,
    reviews: 156,
    image: "/luxury-ocean-view-suite.jpg",
    description: "Stunning ocean views with private balcony and spa access",
    capacity: 2,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "55 sqm",
  },
  {
    id: 4,
    name: "Penthouse",
    price: 1200,
    rating: 5.0,
    reviews: 67,
    image: "/luxury-penthouse.png",
    description: "Exclusive penthouse with rooftop access and concierge service",
    capacity: 6,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "120 sqm",
  },
  {
    id: 5,
    name: "Garden Suite",
    price: 550,
    rating: 4.6,
    reviews: 112,
    image: "/luxury-garden-suite.jpg",
    description: "Serene garden views with direct access to resort grounds",
    capacity: 2,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "50 sqm",
  },
  {
    id: 6,
    name: "Family Villa",
    price: 950,
    rating: 4.8,
    reviews: 89,
    image: "/luxury-family-villa.jpg",
    description: "Perfect for families with multiple bedrooms and living spaces",
    capacity: 6,
    amenities: ["WiFi", "Coffee Maker", "Air Conditioning", "Smart TV"],
    size: "100 sqm",
  },
]

export default function Rooms() {
  const [selectedCapacity, setSelectedCapacity] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 1500])

  const filteredRooms = allRooms.filter((room) => {
    const capacityMatch = !selectedCapacity || room.capacity >= selectedCapacity
    const priceMatch = room.price >= priceRange[0] && room.price <= priceRange[1]
    return capacityMatch && priceMatch
  })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 px-4 bg-gradient-to-br from-primary to-blue-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Rooms & Suites</h1>
          <p className="text-xl text-white/80">Discover our collection of luxurious accommodations</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6">Filters</h3>

              {/* Capacity Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-primary mb-4">Guest Capacity</h4>
                <div className="space-y-2">
                  {[2, 4, 6].map((capacity) => (
                    <button
                      key={capacity}
                      onClick={() => setSelectedCapacity(selectedCapacity === capacity ? null : capacity)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCapacity === capacity ? "bg-accent text-primary" : "bg-secondary hover:bg-muted"
                      }`}
                    >
                      {capacity}+ Guests
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-semibold text-primary mb-4">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-sm text-muted">
                    ${priceRange[0]} - ${priceRange[1]} per night
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="md:col-span-3">
            <div className="grid gap-6">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="grid md:grid-cols-3 gap-6 p-6">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <img
                          src={room.image || "/placeholder.svg"}
                          alt={room.name}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-semibold mb-2">{room.name}</h3>
                              <p className="text-muted mb-4">{room.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-accent">${room.price}</p>
                              <p className="text-sm text-muted">per night</p>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-accent" />
                              <span>Up to {room.capacity} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-accent">📐</span>
                              <span>{room.size}</span>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {room.amenities.map((amenity) => (
                              <span key={amenity} className="text-xs bg-secondary px-3 py-1 rounded-full">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < Math.floor(room.rating) ? "fill-accent text-accent" : "text-muted"}
                                />
                              ))}
                            </div>
                            <span className="font-semibold">{room.rating}</span>
                            <span className="text-sm text-muted">({room.reviews} reviews)</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-6">
                          <Link to={`/rooms/${room.id}`} className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              View Details
                            </Button>
                          </Link>
                          <Link to="/booking" className="flex-1">
                            <Button className="w-full">Book Now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted">No rooms match your filters. Please adjust your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
