"use client"

import { Link } from "react-router-dom"
import { Star } from "lucide-react"

const rooms = [
  {
    id: 1,
    name: "Deluxe Suite",
    price: 450,
    rating: 4.8,
    image: "/luxury-deluxe-suite.jpg",
  },
  {
    id: 2,
    name: "Presidential Suite",
    price: 850,
    rating: 4.9,
    image: "/luxury-presidential-suite.jpg",
  },
  {
    id: 3,
    name: "Ocean View Suite",
    price: 650,
    rating: 4.7,
    image: "/luxury-ocean-view-suite.jpg",
  },
  {
    id: 4,
    name: "Penthouse",
    price: 1200,
    rating: 5.0,
    image: "/luxury-penthouse.png",
  },
]

export default function RoomHighlights() {
  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Our Signature Rooms</h2>
          <p className="text-lg text-muted">Handpicked luxury accommodations for your perfect stay</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <Link key={room.id} to={`/rooms/${room.id}`}>
              <div className="group cursor-pointer h-full">
                <div className="relative h-64 rounded-xl overflow-hidden luxury-shadow mb-4">
                  <img
                    src={room.image || "/placeholder.svg"}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="btn-accent w-full text-center">View Details</span>
                  </div>
                </div>
                <h3 className="heading-sm text-lg mb-2 group-hover:text-accent transition-colors">{room.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-accent">${room.price}/night</p>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-accent text-accent" />
                    <span className="font-semibold text-primary">{room.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
