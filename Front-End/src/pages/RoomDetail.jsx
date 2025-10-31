"use client"

import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Star, Users, MapPin, Wifi, Coffee, Wind, Tv, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../components/UI/button"

const roomsData = {
  1: {
    id: 1,
    name: "Deluxe Suite",
    price: 450,
    rating: 4.8,
    reviews: 128,
    images: ["/placeholder.svg?key=5rcem", "/placeholder.svg?key=4m2s9", "/placeholder.svg?key=ohueb"],
    description:
      "Experience the perfect blend of comfort and elegance in our Deluxe Suite. Featuring premium furnishings, modern amenities, and stunning city views.",
    capacity: 2,
    size: "45 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "King-size bed with premium linens",
      "Marble bathroom with rainfall shower",
      "Work desk with ergonomic chair",
      "Mini bar and safe",
      "24/7 room service",
      "Complimentary toiletries",
    ],
  },
  2: {
    id: 2,
    name: "Presidential Suite",
    price: 850,
    rating: 4.9,
    reviews: 95,
    images: ["/placeholder.svg?key=22b5d", "/placeholder.svg?key=0xvsx", "/placeholder.svg?key=va5gb"],
    description:
      "Our most exclusive offering, the Presidential Suite combines luxury with sophistication. Featuring a separate living area, premium service, and exclusive amenities.",
    capacity: 4,
    size: "85 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "Two bedrooms with king-size beds",
      "Separate living and dining areas",
      "Luxury spa bathroom",
      "Private balcony with city views",
      "Personal concierge service",
      "Premium minibar",
    ],
  },
  3: {
    id: 3,
    name: "Ocean View Suite",
    price: 650,
    rating: 4.7,
    reviews: 156,
    images: ["/placeholder.svg?key=ohueb", "/placeholder.svg?key=22b5d", "/placeholder.svg?key=0xvsx"],
    description:
      "Wake up to breathtaking ocean views from your private balcony. This suite offers the perfect escape with direct access to our spa facilities.",
    capacity: 2,
    size: "55 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "King-size bed with ocean view",
      "Private balcony with lounge chairs",
      "Spa access included",
      "Marble bathroom with soaking tub",
      "Premium toiletries",
      "Complimentary breakfast",
    ],
  },
  4: {
    id: 4,
    name: "Penthouse",
    price: 1200,
    rating: 5.0,
    reviews: 67,
    images: ["/placeholder.svg?key=22b5d", "/placeholder.svg?key=0xvsx", "/placeholder.svg?key=va5gb"],
    description:
      "The ultimate luxury experience. Our exclusive penthouse features rooftop access, panoramic views, and personalized concierge service.",
    capacity: 6,
    size: "120 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "Three bedrooms with luxury bedding",
      "Rooftop terrace with 360° views",
      "Full kitchen and dining area",
      "Spa bathroom with sauna",
      "Private elevator access",
      "Dedicated concierge service",
    ],
  },
  5: {
    id: 5,
    name: "Garden Suite",
    price: 550,
    rating: 4.6,
    reviews: 112,
    images: ["/placeholder.svg?key=0xvsx", "/placeholder.svg?key=va5gb", "/placeholder.svg?key=5rcem"],
    description:
      "Surrounded by lush gardens and serene landscapes, this suite offers a peaceful retreat with direct access to resort grounds.",
    capacity: 2,
    size: "50 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "King-size bed with garden view",
      "Direct garden access",
      "Outdoor shower",
      "Marble bathroom",
      "Garden lounge area",
      "Complimentary breakfast",
    ],
  },
  6: {
    id: 6,
    name: "Family Villa",
    price: 950,
    rating: 4.8,
    reviews: 89,
    images: ["/placeholder.svg?key=va5gb", "/placeholder.svg?key=5rcem", "/placeholder.svg?key=4m2s9"],
    description:
      "Perfect for families, this villa features multiple bedrooms, spacious living areas, and kid-friendly amenities.",
    capacity: 6,
    size: "100 sqm",
    amenities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Coffee, name: "Coffee Maker" },
      { icon: Wind, name: "Air Conditioning" },
      { icon: Tv, name: "Smart TV" },
    ],
    features: [
      "Two bedrooms with family beds",
      "Separate living and dining areas",
      "Full kitchen",
      "Kids play area",
      "Family bathroom with shower",
      "Outdoor patio",
    ],
  },
}

export default function RoomDetail() {
  const { id } = useParams()
  const roomId = Number.parseInt(id)
  const room = roomsData[roomId]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!room) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Room Not Found</h1>
          <Link to="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Image Gallery */}
      <div className="relative w-full h-96 md:h-screen bg-muted pt-20">
        <img
          src={room.images[currentImageIndex] || "/placeholder.svg"}
          alt={room.name}
          className="w-full h-full object-cover"
        />

        {/* Navigation Buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentImageIndex + 1} / {room.images.length}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{room.name}</h1>
              <p className="text-lg text-muted mb-6">{room.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(room.rating) ? "fill-accent text-accent" : "text-muted"}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{room.rating}</span>
                <span className="text-muted">({room.reviews} reviews)</span>
              </div>
            </div>

            {/* Room Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">Room Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-accent" />
                    <span>Capacity: Up to {room.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-accent" />
                    <span>Size: {room.size}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity) => {
                    const Icon = amenity.icon
                    return (
                      <div key={amenity.name} className="flex items-center gap-2">
                        <Icon size={18} className="text-accent" />
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Room Features</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {room.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-accent mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-8 sticky top-24 shadow-lg">
              <div className="mb-6">
                <p className="text-muted text-sm mb-2">Price per night</p>
                <p className="text-4xl font-bold text-accent">${room.price}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted mb-2">Check-in</p>
                  <input type="date" className="w-full bg-background border border-border rounded px-3 py-2" />
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted mb-2">Check-out</p>
                  <input type="date" className="w-full bg-background border border-border rounded px-3 py-2" />
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted mb-2">Guests</p>
                  <select className="w-full bg-background border border-border rounded px-3 py-2">
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link to="/booking" className="w-full">
                <Button className="w-full mb-3">Book Now</Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                Add to Wishlist
              </Button>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted text-center">Free cancellation up to 48 hours before check-in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
