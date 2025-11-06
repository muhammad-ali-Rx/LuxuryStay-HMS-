"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2, Plus, X } from "lucide-react"

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "Standard",
    pricePerNight: "",
    status: "Vacant",
    images: [],
    imageFiles: [],
    amenities: [],
    description: "",
    lastCleaned: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/room/show")
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error("[v0] Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredRooms = () => {
    if (activeTab === "All") return rooms
    return rooms.filter((room) => room.status === activeTab)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Vacant":
        return "bg-teal-100 text-teal-700 border-teal-300"
      case "Occupied":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "Maintenance":
        return "bg-red-100 text-red-700 border-red-300"
      case "Cleaning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "Reserved":
        return "bg-purple-100 text-purple-700 border-purple-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const openModal = (type, room = null) => {
    setError("")
    setSuccess("")
    setModalType(type)
    setSelectedRoom(room)
    if (type === "edit" && room) {
      setFormData({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        status: room.status,
        images: room.images || [],
        imageFiles: [],
        amenities: room.amenities || [],
        description: room.description || "",
        lastCleaned: room.lastCleaned ? room.lastCleaned.split("T")[0] : "",
      })
    } else {
      setFormData({
        roomNumber: "",
        roomType: "Standard",
        pricePerNight: "",
        status: "Vacant",
        images: [],
        imageFiles: [],
        amenities: [],
        description: "",
        lastCleaned: "",
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.roomNumber.trim()) {
      setError("Room number is required")
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("roomNumber", formData.roomNumber)
      formDataToSend.append("roomType", formData.roomType)
      formDataToSend.append("pricePerNight", formData.pricePerNight)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("amenities", JSON.stringify(formData.amenities))
      if (formData.lastCleaned) {
        formDataToSend.append("lastCleaned", formData.lastCleaned)
      }

      if (formData.images.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(formData.images))
      }

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach((imageObj) => {
          formDataToSend.append("images", imageObj.file)
        })
      }

      let response
      if (modalType === "edit" && selectedRoom) {
        console.log("[v0] Sending PUT request to update room:", selectedRoom._id)
        response = await fetch(`http://localhost:3000/room/update/${selectedRoom._id}`, {
          method: "PUT",
          body: formDataToSend,
        })
      } else {
        console.log("[v0] Sending POST request to create new room")
        response = await fetch("http://localhost:3000/room/add", {
          method: "POST",
          body: formDataToSend,
        })
      }

      if (response.ok) {
        setSuccess(`Room ${modalType === "add" ? "created" : "updated"} successfully!`)
        setTimeout(() => {
          fetchRooms()
          setShowModal(false)
        }, 1000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || errorData.message || "Failed to save room"

        if (errorMsg.includes("E11000") || errorMsg.includes("duplicate")) {
          setError(`Room number ${formData.roomNumber} already exists. Please use a different room number.`)
        } else {
          setError(`Error: ${errorMsg}`)
        }
        console.error("[v0] Error:", errorMsg)
      }
    } catch (error) {
      setError(`Error: ${error.message}`)
      console.error("[v0] Error submitting form:", error)
    }
  }

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/room/status/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchRooms()
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const handleDelete = async (roomId) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`http://localhost:3000/room/delete/${roomId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchRooms()
        }
      } catch (error) {
        console.error("[v0] Error deleting room:", error)
      }
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...newImages],
    })
  }

  const removeImageFile = (index) => {
    const newImageFiles = formData.imageFiles.filter((_, i) => i !== index)
    setFormData({ ...formData, imageFiles: newImageFiles })
  }

  const removeExistingImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const filteredRooms = getFilteredRooms()

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Room Inventory</h2>
          <p className="text-gray-600 mt-1">Manage hotel rooms and availability</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal("add")}
          className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Room
        </motion.button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {["All", "Vacant", "Occupied", "Maintenance", "Cleaning", "Reserved"].map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
              activeTab === status
                ? "bg-teal-500 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-teal-500"
            }`}
          >
            {status}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRooms.map((room, idx) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Room Image */}
              <div className="relative h-40 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0] || "/placeholder.svg"}
                    alt={room.roomNumber}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-5xl text-teal-300 font-bold">{room.roomNumber}</div>
                  </div>
                )}
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(room._id)}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Room Number and Type */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Room #{room.roomNumber}</h3>
                  <p className="text-sm text-gray-600">{room.roomType}</p>
                </div>

                {/* Price */}
                <div className="text-xl font-bold text-teal-600">Rs. {room.pricePerNight}</div>

                {/* Status Badge */}
                <div className="flex gap-2 items-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                      room.status,
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => openModal("edit", room)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    <Edit size={18} />
                    Edit
                  </motion.button>

                  {/* Status Dropdown */}
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    className="px-3 py-2 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:border-teal-500 transition-colors"
                  >
                    <option value="Vacant">Vacant</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-bold text-gray-900">{modalType === "add" ? "Add New Room" : "Edit Room"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 font-semibold">{error}</div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 font-semibold">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800">Room Images</label>

                {/* Image Upload Area */}
                <div
                  className="border-3 border-dashed border-teal-300 rounded-xl p-6 bg-teal-50/50 text-center cursor-pointer hover:border-teal-500 transition-colors"
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  <input
                    id="imageInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <div className="text-3xl">📸</div>
                    <p className="text-teal-700 font-semibold">Click to upload or drag images</p>
                    <p className="text-gray-600 text-sm">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                </div>

                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Existing Images</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`existing-${idx}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly Uploaded Images */}
                {formData.imageFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      New Images ({formData.imageFiles.length})
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.imageFiles.map((imageObj, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={imageObj.preview || "/placeholder.svg"}
                            alt={`new-${idx}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-green-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageFile(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="e.g., 101"
                  required
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Room Type</label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Presidential">Presidential</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Family">Family</option>
                  <option value="Twin">Twin</option>~
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Price Per Night (Rs.)</label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="e.g., 3500"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Amenities</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "WiFi",
                    "TV",
                    "AC",
                    "Mini Fridge",
                    "Hot Water",
                    "Bathtub",
                    "Gym Access",
                    "Pool Access",
                    "Room Service",
                    "Air Conditioning",
                  ].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              amenities: [...formData.amenities, amenity],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              amenities: formData.amenities.filter((a) => a !== amenity),
                            })
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer accent-teal-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors resize-none bg-white"
                  placeholder="Add room details and amenities..."
                />
              </div>

              {/* Last Cleaned */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Last Cleaned</label>
                <input
                  type="date"
                  value={formData.lastCleaned}
                  onChange={(e) => setFormData({ ...formData, lastCleaned: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold shadow-md"
                >
                  {modalType === "add" ? "Add Room" : "Update Room"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
