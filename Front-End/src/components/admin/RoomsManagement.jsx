"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit, 
  Trash2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Star, 
  Users, 
  Search,
  Filter,
  Bed,
  Bath,
  Square,
  Wifi,
  Tv,
  Coffee,
  Car,
  Dumbbell,
  Waves,
  Utensils,
  Snowflake
} from "lucide-react";

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("roomNumber");
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
    size: "",
    bedType: "King",
    bathroom: "1",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/room/show");
      const data = await response.json();
      const roomsArray = Array.isArray(data) ? data : data.rooms || [];
      setRooms(roomsArray);
    } catch (error) {
      console.error("[v0] Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRooms = () => {
    let filtered = rooms;
    
    // Filter by active tab
    if (activeTab !== "All") {
      filtered = filtered.filter((room) => room.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((room) =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort rooms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priceLowHigh":
          return a.pricePerNight - b.pricePerNight;
        case "priceHighLow":
          return b.pricePerNight - a.pricePerNight;
        case "roomNumber":
          return a.roomNumber.localeCompare(b.roomNumber);
        case "roomType":
          return a.roomType.localeCompare(b.roomType);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Vacant":
        return "bg-emerald-500/10 text-emerald-700 border border-emerald-200";
      case "Occupied":
        return "bg-blue-500/10 text-blue-700 border border-blue-200";
      case "Maintenance":
        return "bg-rose-500/10 text-rose-700 border border-rose-200";
      case "Cleaning":
        return "bg-amber-500/10 text-amber-700 border border-amber-200";
      case "Reserved":
        return "bg-violet-500/10 text-violet-700 border border-violet-200";
      default:
        return "bg-gray-500/10 text-gray-700 border border-gray-200";
    }
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      "WiFi": <Wifi size={14} />,
      "TV": <Tv size={14} />,
      "AC": <Snowflake size={14} />,
      "Mini Fridge": <Coffee size={14} />,
      "Hot Water": <Waves size={14} />,
      "Bathtub": <Bath size={14} />,
      "Gym Access": <Dumbbell size={14} />,
      "Pool Access": <Waves size={14} />,
      "Room Service": <Utensils size={14} />,
      "Parking": <Car size={14} />,
    };
    return icons[amenity] || <Star size={14} />;
  };

  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData) && amenitiesData.every((a) => typeof a === "string")) {
      return amenitiesData.filter((a) => a && a.trim());
    }
    if (typeof amenitiesData === "string") {
      try {
        const parsed = JSON.parse(amenitiesData);
        if (typeof parsed === "string") {
          return JSON.parse(parsed).filter((a) => a && a.trim());
        }
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => a && a.trim());
        }
      } catch (e) {
        return [amenitiesData].filter((a) => a && a.trim());
      }
    }
    return [];
  };

  const openModal = (type, room = null) => {
    setError("");
    setSuccess("");
    setModalType(type);
    setSelectedRoom(room);
    if (type === "edit" && room) {
      const parsedAmenities = parseAmenities(room.amenities);
      setFormData({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        status: room.status,
        images: room.images || [],
        imageFiles: [],
        amenities: parsedAmenities,
        description: room.description || "",
        lastCleaned: room.lastCleaned ? room.lastCleaned.split("T")[0] : "",
        size: room.size || "",
        bedType: room.bedType || "King",
        bathroom: room.bathroom || "1",
      });
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
        size: "",
        bedType: "King",
        bathroom: "1",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.roomNumber.trim()) {
      setError("Room number is required");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("roomNumber", formData.roomNumber);
      formDataToSend.append("roomType", formData.roomType);
      formDataToSend.append("pricePerNight", formData.pricePerNight);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("size", formData.size);
      formDataToSend.append("bedType", formData.bedType);
      formDataToSend.append("bathroom", formData.bathroom);

      if (formData.amenities.length > 0) {
        formData.amenities.forEach((amenity) => {
          formDataToSend.append("amenities", amenity);
        });
      } else {
        formDataToSend.append("amenities", "[]");
      }

      if (formData.lastCleaned) {
        formDataToSend.append("lastCleaned", formData.lastCleaned);
      }

      if (formData.images.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(formData.images));
      }

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach((imageObj) => {
          formDataToSend.append("images", imageObj.file);
        });
      }

      let response;
      if (modalType === "edit" && selectedRoom) {
        response = await fetch(
          `http://localhost:3000/room/update/${selectedRoom._id}`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
      } else {
        response = await fetch("http://localhost:3000/room/add", {
          method: "POST",
          body: formDataToSend,
        });
      }

      if (response.ok) {
        setSuccess(`Room ${modalType === "add" ? "created" : "updated"} successfully!`);
        setTimeout(() => {
          fetchRooms();
          setShowModal(false);
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.message || "Failed to save room";
        if (errorMsg.includes("E11000") || errorMsg.includes("duplicate")) {
          setError(`Room number ${formData.roomNumber} already exists. Please use a different room number.`);
        } else {
          setError(`Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/room/status/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchRooms();
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error);
    }
  };

  const handleDelete = async (roomId) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`http://localhost:3000/room/delete/${roomId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchRooms();
        }
      } catch (error) {
        console.error("[v0] Error deleting room:", error);
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...newImages],
    });
  };

  const removeImageFile = (index) => {
    const newImageFiles = formData.imageFiles.filter((_, i) => i !== index);
    setFormData({ ...formData, imageFiles: newImageFiles });
  };

  const removeExistingImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const filteredRooms = getFilteredRooms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            >
              Room <span className="bg-gradient-to-r from-[#0A1F44] to-[#00326f] bg-clip-text text-transparent">Inventory</span>
            </motion.h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Manage your hotel's room inventory with real-time status updates and comprehensive room details
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal("add")}
            className="group flex items-center gap-3 bg-[#0A1F44] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#00326f] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus size={22} className="transition-transform group-hover:rotate-90" />
            <span className="whitespace-nowrap">Add New Room</span>
          </motion.button>
        </div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: "Total Rooms", value: rooms.length, color: "gray", icon: <Bed size={20} /> },
            { label: "Vacant", value: rooms.filter(r => r.status === "Vacant").length, color: "emerald", icon: <div className="w-3 h-3 bg-emerald-500 rounded-full" /> },
            { label: "Occupied", value: rooms.filter(r => r.status === "Occupied").length, color: "blue", icon: <div className="w-3 h-3 bg-blue-500 rounded-full" /> },
            { label: "Maintenance", value: rooms.filter(r => r.status === "Maintenance").length, color: "rose", icon: <div className="w-3 h-3 bg-rose-500 rounded-full" /> },
            { label: "Cleaning", value: rooms.filter(r => r.status === "Cleaning").length, color: "amber", icon: <div className="w-3 h-3 bg-amber-500 rounded-full" /> },
            { label: "Reserved", value: rooms.filter(r => r.status === "Reserved").length, color: "violet", icon: <div className="w-3 h-3 bg-violet-500 rounded-full" /> },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rooms by number, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
              />
            </div>
            
            {/* Sort */}
            <div className="flex gap-3 w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white font-medium"
              >
                <option value="roomNumber">Sort by Room Number</option>
                <option value="roomType">Sort by Type</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-8"
        >
          {["All", "Vacant", "Occupied", "Maintenance", "Cleaning", "Reserved"].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(status)}
              className={`group flex items-center gap-2 px-6 py-3.5 rounded-xl whitespace-nowrap font-semibold transition-all duration-300 border-2 ${
                activeTab === status
                  ? "bg-[#0A1F44] text-white border-[#0A1F44] shadow-lg"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#0A1F44] hover:text-[#0A1F44] hover:shadow-md"
              }`}
            >
              {activeTab === status && (
                <motion.div
                  layoutId="activeTab"
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
              {status}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-16 w-16 border-4 border-[#0A1F44] border-t-transparent mx-auto mb-4"
              />
              <p className="text-gray-600 font-medium">Loading rooms...</p>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredRooms.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50"
                >
                  <div className="text-gray-400 mb-4">
                    <Bed size={80} className="mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No rooms found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {activeTab === "All" && !searchTerm
                      ? "Get started by adding your first room to the inventory."
                      : `No ${activeTab !== "All" ? activeTab.toLowerCase() : ""} rooms match your search criteria.`}
                  </p>
                  {activeTab === "All" && !searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal("add")}
                      className="bg-[#0A1F44] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#00326f] transition-all duration-300"
                    >
                      Add Your First Room
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                filteredRooms.map((room, idx) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                  >
                    {/* Room Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {room.images && room.images.length > 0 ? (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          src={room.images[0] || "/placeholder.svg"}
                          alt={room.roomNumber}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={48} className="mb-2" />
                          <span className="text-sm font-medium">No Image</span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(room.status)}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            room.status === "Vacant" ? "bg-emerald-500" :
                            room.status === "Occupied" ? "bg-blue-500" :
                            room.status === "Maintenance" ? "bg-rose-500" :
                            room.status === "Cleaning" ? "bg-amber-500" :
                            "bg-violet-500"
                          }`} />
                          {room.status}
                        </span>
                      </div>
                      
                      {/* Price Overlay */}
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-xl backdrop-blur-sm">
                        <div className="text-lg font-bold">Rs. {room.pricePerNight}</div>
                        <div className="text-xs opacity-80">per night</div>
                      </div>
                      
                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(room._id)}
                        className="absolute bottom-4 right-4 bg-rose-500 text-white p-2.5 rounded-xl hover:bg-rose-600 transition-colors shadow-lg backdrop-blur-sm"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Room Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Room #{room.roomNumber}
                          </h3>
                          <p className="text-gray-600 font-medium">{room.roomType}</p>
                        </div>
                      </div>

                      {/* Room Features */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {room.bedType && (
                          <div className="flex items-center gap-1">
                            <Bed size={16} className="text-gray-400" />
                            <span>{room.bedType}</span>
                          </div>
                        )}
                        {room.bathroom && (
                          <div className="flex items-center gap-1">
                            <Bath size={16} className="text-gray-400" />
                            <span>{room.bathroom} Bath</span>
                          </div>
                        )}
                        {room.size && (
                          <div className="flex items-center gap-1">
                            <Square size={16} className="text-gray-400" />
                            <span>{room.size} sq.ft</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {room.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {room.description}
                        </p>
                      )}

                      {/* Amenities Preview */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 4).map((amenity, index) => (
                            <motion.span
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200"
                            >
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </motion.span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                              +{room.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal("edit", room)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#0A1F44] text-white py-3 rounded-xl hover:bg-[#00326f] transition-all duration-300 font-semibold shadow-sm"
                        >
                          <Edit size={18} />
                          Edit Room
                        </motion.button>

                        {/* Status Dropdown */}
                        <select
                          value={room.status}
                          onChange={(e) => handleStatusChange(room._id, e.target.value)}
                          className="px-4 py-3 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:border-gray-400 transition-colors focus:outline-none focus:border-[#0A1F44] min-w-[140px]"
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
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-8 pb-6 rounded-t-3xl z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {modalType === "add" ? "Add New Room" : "Edit Room"}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {modalType === "add" ? "Create a new room entry in your inventory" : "Update room details and amenities"}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-3 hover:bg-gray-100 rounded-2xl"
                  >
                    <X size={28} />
                  </motion.button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="block text-lg font-bold text-gray-900">
                      Room Images
                    </label>

                    {/* Image Upload Area */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="border-3 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 text-center cursor-pointer hover:border-gray-400 transition-all duration-300 hover:bg-gray-100"
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
                      <div className="space-y-4">
                        <div className="text-5xl">🏨</div>
                        <div>
                          <p className="text-gray-700 font-semibold text-xl mb-2">
                            Upload Room Images
                          </p>
                          <p className="text-gray-500 text-sm">
                            Drag & drop images here or click to browse
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Image Previews */}
                    {(formData.images.length > 0 || formData.imageFiles.length > 0) && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      >
                        {formData.images.map((image, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`existing-${idx}`}
                              className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.div>
                        ))}

                        {formData.imageFiles.map((imageObj, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: (formData.images.length + idx) * 0.1 }}
                            className="relative group"
                          >
                            <img
                              src={imageObj.preview || "/placeholder.svg"}
                              alt={`new-${idx}`}
                              className="w-full h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-sm"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              type="button"
                              onClick={() => removeImageFile(idx)}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Room Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                        placeholder="e.g., 101"
                        required
                      />
                    </div>

                    {/* Room Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Room Type
                      </label>
                      <select
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Presidential">Presidential</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Family">Family</option>
                        <option value="Twin">Twin</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Price Per Night (Rs.) *
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                        placeholder="e.g., 3500"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                      >
                        <option value="Vacant">Vacant</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Reserved">Reserved</option>
                      </select>
                    </div>

                    {/* Bed Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Bed Type
                      </label>
                      <select
                        value={formData.bedType}
                        onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                      >
                        <option value="King">King Bed</option>
                        <option value="Queen">Queen Bed</option>
                        <option value="Double">Double Bed</option>
                        <option value="Single">Single Bed</option>
                        <option value="Twin">Twin Beds</option>
                        <option value="Bunk">Bunk Beds</option>
                      </select>
                    </div>

                    {/* Bathroom */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Bathrooms
                      </label>
                      <select
                        value={formData.bathroom}
                        onChange={(e) => setFormData({ ...formData, bathroom: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                      >
                        <option value="1">1 Bathroom</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                      </select>
                    </div>

                    {/* Room Size */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Room Size (sq.ft)
                      </label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                        placeholder="e.g., 450"
                      />
                    </div>

                    {/* Last Cleaned */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Last Cleaned
                      </label>
                      <input
                        type="date"
                        value={formData.lastCleaned}
                        onChange={(e) => setFormData({ ...formData, lastCleaned: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div className="space-y-4">
                    <label className="block text-lg font-bold text-gray-900">
                      Amenities & Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl">
                      {[
                        "WiFi", "TV", "AC", "Mini Fridge", "Hot Water", "Bathtub", 
                        "Gym Access", "Pool Access", "Room Service", "Air Conditioning",
                        "Sea View", "Balcony", "Parking", "Kitchenette", "Safe", "Jacuzzi"
                      ].map((amenity) => (
                        <motion.label
                          key={amenity}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-all duration-300"
                        >
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  amenities: [...formData.amenities, amenity],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  amenities: formData.amenities.filter((a) => a !== amenity),
                                });
                              }
                            }}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#0A1F44] focus:ring-[#0A1F44] cursor-pointer transition-colors"
                          />
                          <span className="flex items-center gap-2 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-gray-900">
                      Room Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-[#0A1F44]/20 outline-none transition-all duration-300 resize-none bg-white"
                      placeholder="Describe the room features, view, special amenities, and any unique characteristics..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 pt-8 border-t border-gray-200"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-8 py-4 bg-[#0A1F44] text-white rounded-xl hover:bg-[#00326f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      {modalType === "add" ? "Create Room" : "Update Room"}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}