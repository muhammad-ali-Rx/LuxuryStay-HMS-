"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { X, Search, Grid3X3, Square, Star } from "lucide-react"
import axios from "axios"

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeCategory, setActiveCategory] = useState("All")
  const [viewMode, setViewMode] = useState("masonry")
  const [searchTerm, setSearchTerm] = useState("")
  const [galleryImages, setGalleryImages] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch images from APIs
  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        setLoading(true)
        
        // Fetch restaurants
        const restaurantsResponse = await axios.get("http://localhost:3000/restaurants")
        const restaurants = restaurantsResponse.data.data || restaurantsResponse.data
        
        // Fetch rooms
        const roomsResponse = await axios.get("http://localhost:3000/room/show")
        const rooms = roomsResponse.data.data || roomsResponse.data

        // Transform restaurant data into gallery format
        const restaurantImages = restaurants.flatMap(restaurant => 
          (restaurant.images || []).map((image, index) => ({
            id: `restaurant-${restaurant._id}-${index}`,
            title: restaurant.name,
            category: "Restaurants",
            image: image,
            description: restaurant.description,
            cuisine: restaurant.cuisine,
            location: restaurant.location,
            rating: restaurant.rating || 4.5
          }))
        )

        // Transform room data into gallery format
        const roomImages = rooms.flatMap(room => 
          (room.images || []).map((image, index) => ({
            id: `room-${room._id}-${index}`,
            title: room.name || `Room ${room.roomNumber || room._id}`,
            category: "Rooms",
            image: image,
            description: room.description || `Luxurious ${room.type || 'room'}`,
            type: room.type,
            price: room.price,
            amenities: room.amenities || [],
            rating: room.rating || 4.8
          }))
        )

        const allImages = [...restaurantImages, ...roomImages]
        setGalleryImages(allImages)

      } catch (error) {
        console.error("Error fetching gallery images:", error)
        setGalleryImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllImages()
  }, [])

  const categories = ["All", "Restaurants", "Rooms"]
  
  const filteredImages = galleryImages.filter((img) => {
    const matchesCategory = activeCategory === "All" || img.category === activeCategory
    const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         img.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         img.type?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Masonry layout with 3 columns
  const createMasonryGrid = (columns = 3) => {
    const columnHeights = new Array(columns).fill(0)
    const columnsArray = Array.from({ length: columns }, () => [])
    
    filteredImages.forEach((image) => {
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
      columnsArray[minHeightIndex].push(image)
      
      // Add random height for realistic Pinterest look
      const randomHeight = 300 + Math.random() * 400 // Larger images
      columnHeights[minHeightIndex] += randomHeight
    })
    
    return columnsArray
  }

  const masonryColumns = createMasonryGrid(3)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Top Hero Section */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover <span className="text-[#FF8600]">Luxury</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our exquisite collection of premium rooms and fine dining restaurants
          </p>
          
         

          {/* CTA Button */}
          <button className="bg-[#FF8600] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            Book Your Stay Now
          </button>
        </div>
      </section>

      {/* Controls Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search rooms, restaurants, cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-[#FF8600] focus:bg-white focus:shadow-lg transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      activeCategory === category 
                        ? "bg-[#FF8600] text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-full transition-all ${
                    viewMode === "grid" ? "bg-white text-[#FF8600] shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`p-3 rounded-full transition-all ${
                    viewMode === "masonry" ? "bg-white text-[#FF8600] shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Square size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="w-full p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF8600]"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">No images found. Try a different search.</p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid Layout - 3 columns
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredImages.map((image) => (
              <GridCard key={image.id} image={image} onClick={() => setSelectedImage(image)} />
            ))}
          </div>
        ) : (
          // Masonry Layout - 3 columns
          <div className="flex gap-8 justify-center max-w-7xl mx-auto">
            {masonryColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex-1 max-w-[400px] space-y-8">
                {column.map((image) => (
                  <PinterestCard key={image.id} image={image} onClick={() => setSelectedImage(image)} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-[#FF8600] transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X size={32} />
            </button>
            
            <div className="bg-white rounded-2xl overflow-hidden w-full h-full flex flex-col lg:flex-row">
              <div className="lg:w-2/3 h-full">
                <img 
                  src={selectedImage.image || "/api/placeholder/800/600"} 
                  alt={selectedImage.title}
                  className="w-full h-full object-contain max-h-full"
                />
              </div>
              
              <div className="lg:w-1/3 p-8 flex flex-col h-full">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedImage.title}</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-[#FF8600] text-white rounded-full text-sm font-medium">
                    {selectedImage.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="fill-[#FF8600] text-[#FF8600]" size={20} />
                    <span className="font-semibold text-gray-700">{selectedImage.rating}</span>
                  </div>
                </div>
                
                {selectedImage.cuisine && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {selectedImage.cuisine}
                    </span>
                  </div>
                )}
                
                {selectedImage.type && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {selectedImage.type}
                    </span>
                  </div>
                )}
                
                {selectedImage.price && (
                  <p className="text-[#FF8600] font-bold text-2xl mb-4">{selectedImage.price}</p>
                )}
                
                {selectedImage.description && (
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    {selectedImage.description}
                  </p>
                )}
                
                <button className="mt-auto bg-[#FF8600] text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

// Pinterest Style Card - Larger for 3 columns
function PinterestCard({ image, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div 
      className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={image.image || "/api/placeholder/400/400"}
            alt={image.title}
            className={`w-full h-auto object-cover transition-transform duration-700 ${
              imageLoaded ? 'group-hover:scale-110' : ''
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3EImage not found%3C/text%3E%3C/svg%3E"
            }}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-[#FF8600] text-white rounded-full text-sm font-medium">
              {image.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="fill-[#FF8600] text-[#FF8600]" size={16} />
              <span className="font-semibold text-gray-700 text-sm">{image.rating}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-800 text-xl mb-2 line-clamp-2">
            {image.title}
          </h3>
          
          {image.description && (
            <p className="text-gray-600 text-base line-clamp-3 mb-3">
              {image.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {image.price && (
              <p className="text-[#FF8600] font-bold text-lg">
                {image.price}
              </p>
            )}
            {image.cuisine && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {image.cuisine}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid Card Component - Larger for 3 columns
function GridCard({ image, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={image.image || "/api/placeholder/400/500"}
          alt={image.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            imageLoaded ? 'group-hover:scale-110' : ''
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#FF8600] rounded-full text-sm font-medium">
              {image.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
              <span className="font-semibold text-sm">{image.rating}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-xl mb-2">{image.title}</h3>
          
          {image.description && (
            <p className="text-white/90 text-sm line-clamp-2 mb-2">
              {image.description}
            </p>
          )}
          
          {image.price && (
            <p className="text-[#FF8600] font-bold text-lg">
              {image.price}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}