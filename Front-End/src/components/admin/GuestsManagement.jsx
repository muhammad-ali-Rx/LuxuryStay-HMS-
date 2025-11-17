"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Edit, Trash2, Search, Plus, Filter, Download, Eye, User, AlertCircle, XCircle } from "lucide-react"
import { Button } from "../ui/button"

const API_BASE_URL = "http://localhost:3000"

export default function GuestsManagement() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterCountry, setFilterCountry] = useState("")

  // Fetch all users from backend
  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log("🔄 Fetching guests from API...")
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log("📨 API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error response:", errorText)
        throw new Error(`Failed to fetch guests: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ API Response data:", result)
      
      // FIX: Check if data exists and is an array
      if (result.success) {
        let guestUsers = []
        
        // Handle different response formats
        if (Array.isArray(result.data)) {
          // If data is already an array
          guestUsers = result.data
        } else if (result.data && Array.isArray(result.data.users)) {
          // If data has users array
          guestUsers = result.data.users
        } else if (Array.isArray(result.users)) {
          // If response has users array directly
          guestUsers = result.users
        } else {
          console.warn("⚠️ Unexpected API response format:", result)
          guestUsers = []
        }
        
        // Filter only guest users (non-admin roles)
        const filteredGuests = guestUsers.filter(user => {
          if (!user) return false
          
          const userRole = user.role?.toLowerCase() || 'user'
          const isGuest = !['admin', 'manager', 'staff', 'receptionist'].includes(userRole)
          return isGuest
        })
        
        console.log("👥 Filtered guests:", filteredGuests)
        setGuests(filteredGuests)
      } else {
        throw new Error(result.message || 'Failed to load guests')
      }
    } catch (error) {
      console.error("❌ Error fetching guests:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm("Are you sure you want to delete this guest? This action cannot be undone.")) {
      return
    }

    try {
      console.log("🗑️ Deleting guest:", guestId)
      const response = await fetch(`${API_BASE_URL}/users/delete/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete guest')
      }

      const result = await response.json()
      
      if (result.success) {
        setGuests(prev => prev.filter(guest => guest._id !== guestId))
        alert("✅ Guest deleted successfully!")
      } else {
        throw new Error(result.message || 'Failed to delete guest')
      }
    } catch (error) {
      console.error("❌ Error deleting guest:", error)
      alert(`❌ ${error.message || "Failed to delete guest"}`)
    }
  }

  const handleEditGuest = (guest) => {
    setSelectedGuest(guest)
    setShowModal(true)
  }

  const handleViewDetails = (guest) => {
    setSelectedGuest({...guest, viewMode: true})
    setShowModal(true)
  }

  const handleUpdateGuest = async (updatedData) => {
    try {
      console.log("📝 Updating guest:", selectedGuest._id, updatedData)
      const response = await fetch(`${API_BASE_URL}/users/update/${selectedGuest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update guest')
      }

      const result = await response.json()
      
      if (result.success) {
        setGuests(prev => prev.map(guest => 
          guest._id === selectedGuest._id ? { ...guest, ...updatedData } : guest
        ))
        setShowModal(false)
        setSelectedGuest(null)
        alert("✅ Guest updated successfully!")
      } else {
        throw new Error(result.message || 'Failed to update guest')
      }
    } catch (error) {
      console.error("❌ Error updating guest:", error)
      alert(`❌ ${error.message || "Failed to update guest"}`)
    }
  }

  const handleExportGuests = () => {
    if (guests.length === 0) {
      alert("No guests data to export")
      return
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Country,Role,Member Since\n"
      + guests.map(guest => 
          `"${guest.name || 'N/A'}","${guest.email || 'N/A'}","${guest.phone || 'N/A'}","${guest.address?.country || 'N/A'}","${guest.role || 'user'}","${guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : 'Unknown'}"`
        ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `guests_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddGuest = () => {
    // For now, show a message about adding guests
    alert("To add a new guest, please use the user registration system. Guests can register themselves through the website.")
  }

  // Filter and search guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      (guest.name && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.phone && guest.phone.includes(searchTerm))
    
    const matchesCountry = !filterCountry || 
      (guest.address?.country && guest.address.country.toLowerCase().includes(filterCountry.toLowerCase()))
    
    return matchesSearch && matchesCountry
  })

  const uniqueCountries = [...new Set(guests.map(guest => guest.address?.country).filter(Boolean))].sort()

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-[#0A1F44]">Guests Management</h2>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="text-gray-600">Loading guests data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0A1F44]">Guests Management</h2>
          <p className="text-gray-600 mt-1">Manage all hotel guests and their information</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportGuests}
            variant="outline"
            className="flex items-center gap-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
            disabled={guests.length === 0}
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button 
            onClick={handleAddGuest}
            className="flex items-center gap-2 bg-[#0A1F44] hover:bg-[#1a3a6d] text-white transition-colors"
          >
            <Plus size={18} />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Search and Filters - IMPROVED STYLING */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search - FIXED: Icon properly centered */}
          <div className="relative">
            <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Country Filter - FIXED: Icon properly centered */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none bg-white cursor-pointer transition-all duration-200"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Stats - IMPROVED STYLING */}
          <div className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a6d] rounded-lg p-4 text-center text-white shadow-md">
            <p className="text-sm opacity-90">Total Guests</p>
            <p className="text-2xl font-bold">{filteredGuests.length}</p>
          </div>
        </div>
      </div>

      {/* Error Display - IMPROVED STYLING */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <p className="font-semibold">Error Loading Guests</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <Button 
            onClick={fetchGuests}
            variant="outline" 
            className="mt-3 bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Guests Grid - IMPROVED STYLING */}
      {!error && (
        <>
          {filteredGuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuests.map((guest, idx) => (
                <motion.div
                  key={guest._id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#D4AF37]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#0A1F44]">{guest.name || 'Unnamed Guest'}</h3>
                      <p className="text-sm text-gray-600">ID: {guest._id?.substring(0, 8) || 'N/A'}</p>
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
                        {guest.role || 'user'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#f4d158] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-[#0A1F44] font-bold text-lg">
                        {(guest.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={18} className="text-[#D4AF37] flex-shrink-0" />
                      <span className="text-sm truncate">{guest.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={18} className="text-[#D4AF37] flex-shrink-0" />
                      <span className="text-sm">{guest.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={18} className="text-[#D4AF37] flex-shrink-0" />
                      <span className="text-sm">{guest.address?.country || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="text-gray-700 font-medium">
                        {guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(guest)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditGuest(guest)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteGuest(guest._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2 font-medium">
                {guests.length === 0 ? "No guests found in the system" : "No guests match your search criteria"}
              </p>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                {guests.length === 0 
                  ? "Guests will appear here once they register through the website" 
                  : "Try adjusting your search terms or filters"
                }
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setFilterCountry("")
                }}
                className="bg-[#0A1F44] hover:bg-[#1a3a6d] transition-colors"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Guest Details/Edit Modal - IMPROVED STYLING */}
      {showModal && selectedGuest && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-[#0A1F44]">
                {selectedGuest.viewMode ? `${selectedGuest.name}'s Details` : 'Edit Guest'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedGuest(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedGuest.name || ''}
                  onChange={(e) => setSelectedGuest({...selectedGuest, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
                  readOnly={selectedGuest.viewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedGuest.email || ''}
                  onChange={(e) => setSelectedGuest({...selectedGuest, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
                  readOnly={selectedGuest.viewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={selectedGuest.phone || ''}
                  onChange={(e) => setSelectedGuest({...selectedGuest, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
                  readOnly={selectedGuest.viewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={selectedGuest.address?.country || ""}
                  onChange={(e) => setSelectedGuest({
                    ...selectedGuest, 
                    address: {...selectedGuest.address, country: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
                  readOnly={selectedGuest.viewMode}
                />
              </div>

              {selectedGuest.createdAt && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Member Since:</strong> {new Date(selectedGuest.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Role:</strong> {selectedGuest.role || 'user'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  setSelectedGuest(null)
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {selectedGuest.viewMode ? 'Close' : 'Cancel'}
              </Button>
              {!selectedGuest.viewMode && (
                <Button
                  onClick={() => handleUpdateGuest(selectedGuest)}
                  className="flex-1 bg-[#0A1F44] hover:bg-[#1a3a6d] text-white transition-colors"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}