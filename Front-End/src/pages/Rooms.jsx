"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Star, Users, DollarSign } from "lucide-react";
import { Button } from "../components/UI/button";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 6000]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/room/show");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        // Handle different possible response structures
        let roomsData = [];
        
        if (Array.isArray(data)) {
          roomsData = data;
        } else if (data.rooms && Array.isArray(data.rooms)) {
          roomsData = data.rooms;
        } else if (data.data && Array.isArray(data.data)) {
          roomsData = data.data;
        } else {
          console.warn("Unexpected API response structure:", data);
          roomsData = [];
        }
        
        console.log("Processed rooms:", roomsData);
        setRooms(roomsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Calculate dynamic price range based on actual room prices
  const calculatePriceRange = () => {
    if (rooms.length === 0) return [0, 6000];
    
    const prices = rooms.map(room => room.pricePerNight).filter(price => !isNaN(price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Round to nearest 500 for better UX
    return [Math.floor(minPrice / 500) * 500, Math.ceil(maxPrice / 500) * 500];
  };

  // Filter rooms based on capacity and price
  const filteredRooms = rooms.filter((room) => {
    // ✅ FIXED: Show rooms with capacity >= selected capacity
    const capacityMatch =
      !selectedCapacity || (room.capacity && room.capacity >= selectedCapacity);
    const priceMatch =
      room.pricePerNight >= priceRange[0] &&
      room.pricePerNight <= priceRange[1];
    
    return capacityMatch && priceMatch;
  });

  // ✅ ADDED: Function to handle rating submission
  const submitRating = async (roomId, rating) => {
    try {
      // Generate user ID for demo (in real app, use actual user ID)
      const userId = 'user_' + Date.now();
      
      const response = await fetch(`http://localhost:3000/room/${roomId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          rating: rating
        })
      });

      if (response.ok) {
        // Refresh rooms data to show updated ratings
        const roomsResponse = await fetch("http://localhost:3000/room/show");
        const roomsData = await roomsResponse.json();
        
        let updatedRooms = [];
        if (Array.isArray(roomsData)) {
          updatedRooms = roomsData;
        } else if (roomsData.rooms && Array.isArray(roomsData.rooms)) {
          updatedRooms = roomsData.rooms;
        } else if (roomsData.data && Array.isArray(roomsData.data)) {
          updatedRooms = roomsData.data;
        }
        
        setRooms(updatedRooms);
        alert(`Thanks for your ${rating} star rating!`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-12 px-4 text-center">
          <p className="text-muted">Loading rooms...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-12 px-4 text-center">
          <p className="text-red-600">Error loading rooms: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const dynamicPriceRange = calculatePriceRange();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 px-4 bg-gradient-to-br from-primary to-blue-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Rooms & Suites
          </h1>
          <p className="text-xl text-white/80">
            Discover our collection of luxurious accommodations
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedCapacity(null);
              setPriceRange(dynamicPriceRange);
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6">Filters</h3>

              {/* Capacity Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-primary mb-4">
                  Guest Capacity
                </h4>
                <div className="space-y-2">
                  {[2, 4, 6].map((capacity) => (
                    <button
                      key={capacity}
                      onClick={() =>
                        setSelectedCapacity(
                          selectedCapacity === capacity ? null : capacity
                        )
                      }
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCapacity === capacity
                          ? "bg-accent text-primary"
                          : "bg-secondary hover:bg-muted"
                      }`}
                    >
                      {capacity}+ Guests {/* ✅ Changed back to show capacity and above */}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-semibold text-primary mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={dynamicPriceRange[0]}
                    max={dynamicPriceRange[1]}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        Number.parseInt(e.target.value),
                      ])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {dynamicPriceRange[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {dynamicPriceRange[1]}
                    </span>
                  </div>
                  <p className="text-sm text-muted text-center flex items-center justify-center gap-1">
                    <DollarSign size={12} />
                    {priceRange[0]} - <DollarSign size={12} />
                    {priceRange[1]} per night
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
                    key={room._id || room.roomNumber}
                    className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="grid md:grid-cols-3 gap-6 p-6">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <img
                          src={room.images?.[0] || "/placeholder.svg"}
                          alt={room.roomType}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-semibold mb-2">
                                Room {room.roomNumber}
                              </h3>
                              <p className="text-muted mb-4">
                                {room.description ||
                                  `${room.roomType} - Premium accommodation`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-teal-600 flex items-center gap-1">
                                <DollarSign size={24} />
                                {room.pricePerNight}
                              </p>
                              <p className="text-sm text-gray-600">per night</p>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-accent" />
                              <span>Up to {room.capacity || 2} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-accent">📐</span>
                              <span>{room.roomType}</span>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Array.isArray(room.amenities) &&
                            room.amenities.length > 0 ? (
                              room.amenities
                                .filter(
                                  (a) =>
                                    typeof a === "string" && a.trim() !== ""
                                )
                                .map((amenity, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-secondary px-3 py-1 rounded-full"
                                  >
                                    {amenity}
                                  </span>
                                ))
                            ) : room.amenities &&
                              typeof room.amenities === "string" ? (
                              <span className="text-xs bg-secondary px-3 py-1 rounded-full">
                                {room.amenities}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                No amenities listed
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                room.status === "Vacant" || room.status === "Available"
                                  ? "bg-green-100 text-green-800"
                                  : room.status === "Occupied"
                                  ? "bg-red-100 text-red-800"
                                  : room.status === "Maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {room.status || "Unknown"}
                            </span>
                          </div>

                          {/* Rating Section */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={
                                      i < Math.floor(room.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">{room.rating || 0}</span>
                              <span className="text-sm text-muted">
                                ({room.reviewsCount || 0} reviews)
                              </span>
                            </div>
                            
                            {/* ✅ ADDED: Rate this room buttons */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted">Rate this room:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => submitRating(room._id, star)}
                                    className="text-lg transition-transform hover:scale-110 focus:outline-none"
                                  >
                                    <span className="text-gray-400 hover:text-yellow-400">⭐</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-6">
                          <Link to={`/rooms/${room._id || room.roomNumber}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full bg-transparent"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link 
                            to={`/booking?roomId=${room._id}&roomNumber=${room.roomNumber}`} 
                            className="flex-1"
                          >
                            <Button 
                              className="w-full"
                              disabled={room.status && room.status !== "Vacant" && room.status !== "Available"}
                            >
                              {room.status && room.status !== "Vacant" && room.status !== "Available" 
                                ? "Not Available" 
                                : "Book Now"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted">
                    No rooms match your filters. Please adjust your criteria.
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedCapacity(null);
                      setPriceRange(dynamicPriceRange);
                    }}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}