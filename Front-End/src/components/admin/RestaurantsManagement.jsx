import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  Users,
  MapPin,
  Upload,
  X,
  Calendar,
  Phone,
  User,
  Image as ImageIcon,
  Building,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; 

const RestaurantsManagement = () => {
  const { userAuth, adminUser } = useAuth();
  
  // Constants
  const cuisines = [
    "French", "Italian", "Japanese", "Indian", "International",
    "Mexican", "Chinese", "Mediterranean", "American", "Fusion",
  ];
  
  const priceRanges = ["$", "$$", "$$$", "$$$$"];
  const statuses = ["active", "inactive", "under_renovation"];
  const reservationStatuses = ["pending", "confirmed", "cancelled", "completed"];

  // State
  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const [reservationFilter, setReservationFilter] = useState("all");
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    cuisine: "French",
    description: "",
    priceRange: "$$",
    capacity: 50,
    location: "",
    status: "active",
    images: [],
    tags: [],
    contact: {
      phone: "",
      email: "",
      extension: "",
    },
    features: {
      hasOutdoorSeating: false,
      hasPrivateDining: false,
      hasWifi: true,
      isWheelchairAccessible: true,
      hasParking: true,
    },
    openingHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "10:00", close: "23:00", closed: false },
      sunday: { open: "10:00", close: "22:00", closed: false },
    },
  });

  // Auth helper
  const getToken = () => {
    try {
      return localStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchReservations();
  }, []);

  // API Functions
  const fetchRestaurants = async () => {
    try {
      setError("");
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get("http://localhost:3000/restaurants", {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError(error.response?.data?.message || "Failed to fetch restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get("http://localhost:3000/reservations", {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      
      const reservationsData = response.data?.data || response.data || [];
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const token = getToken();
      await axios.put(
        `http://localhost:3000/reservations/${reservationId}`,
        { status: newStatus },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchReservations();
    } catch (error) {
      console.error("Error updating reservation:", error);
      setError(error.response?.data?.message || "Error updating reservation.");
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    try {
      setImageUploading(true);
      const files = Array.from(e.target.files);
      
      const imagePromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...imageUrls] 
      }));
      
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Error uploading images. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  // Remove Image Function
  const removeImage = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  // Form Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const currentUserId = userAuth?.id || adminUser?.id;
      if (!currentUserId) {
        setError("User information not found. Please login again.");
        return;
      }

      const restaurantData = {
        name: formData.name.trim(),
        cuisine: formData.cuisine,
        description: formData.description.trim(),
        priceRange: formData.priceRange,
        capacity: parseInt(formData.capacity) || 50,
        location: formData.location.trim(),
        status: formData.status,
        images: formData.images,
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        contact: formData.contact,
        features: formData.features,
        openingHours: formData.openingHours,
        createdBy: currentUserId,
      };

      // Validation
      if (!restaurantData.name.trim()) {
        setError("Restaurant name is required");
        return;
      }
      if (!restaurantData.description.trim()) {
        setError("Description is required");
        return;
      }
      if (!restaurantData.location.trim()) {
        setError("Location is required");
        return;
      }

      let response;
      if (editingRestaurant) {
        response = await axios.put(
          `http://localhost:3000/restaurants/${editingRestaurant._id}`,
          restaurantData,
          { 
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:3000/restaurants", 
          restaurantData,
          { 
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setShowModal(false);
      setEditingRestaurant(null);
      resetForm();
      fetchRestaurants();
      
    } catch (error) {
      console.error("Error saving restaurant:", error);
      setError(error.response?.data?.message || "Error saving restaurant. Please try again.");
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || "",
      cuisine: restaurant.cuisine || "French",
      description: restaurant.description || "",
      priceRange: restaurant.priceRange || "$$",
      capacity: restaurant.capacity || 50,
      location: restaurant.location || "",
      status: restaurant.status || "active",
      images: restaurant.images || [],
      tags: restaurant.tags || [],
      contact: restaurant.contact || { phone: "", email: "", extension: "" },
      features: restaurant.features || {
        hasOutdoorSeating: false, hasPrivateDining: false, hasWifi: true,
        isWheelchairAccessible: true, hasParking: true,
      },
      openingHours: restaurant.openingHours || {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "23:00", closed: false },
        saturday: { open: "10:00", close: "23:00", closed: false },
        sunday: { open: "10:00", close: "22:00", closed: false },
      },
    });
    setShowModal(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:3000/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRestaurants();
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        setError(error.response?.data?.message || "Error deleting restaurant.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", cuisine: "French", description: "", priceRange: "$$", capacity: 50,
      location: "", status: "active", images: [], tags: [],
      contact: { phone: "", email: "", extension: "" },
      features: {
        hasOutdoorSeating: false, hasPrivateDining: false, hasWifi: true,
        isWheelchairAccessible: true, hasParking: true,
      },
      openingHours: {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "23:00", closed: false },
        saturday: { open: "10:00", close: "23:00", closed: false },
        sunday: { open: "10:00", close: "22:00", closed: false },
      },
    });
    setEditingRestaurant(null);
    setError("");
  };

  // Utility Functions
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || restaurant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredReservations = reservations.filter((reservation) => {
    if (reservationFilter === "all") return true;
    return reservation.status === reservationFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border border-green-200",
      inactive: "bg-red-100 text-red-800 border border-red-200",
      under_renovation: "bg-yellow-100 text-yellow-800 border border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getReservationStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Stats
  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Restaurants Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurants and reservations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("reservations")}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Calendar size={18} />
            Reservations ({reservations.length})
          </button>
          <button
            onClick={() => { setActiveTab("restaurants"); setShowModal(true); }}
            className="bg-[#D4AF37] text-[#0A1F44] px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#c19b2a] transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} />
            Add Restaurant
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError("")} 
              className="text-red-700 hover:text-red-900 ml-4"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("restaurants")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "restaurants"
              ? "border-[#D4AF37] text-[#D4AF37]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Building size={18} />
            Restaurants ({restaurants.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "reservations"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            Reservations ({reservations.length})
          </div>
        </button>
      </div>

      {/* Restaurants Tab */}
      {activeTab === "restaurants" && (
        <>
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search restaurants by name, cuisine, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent min-w-[180px]"
              >
                <option value="all">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Restaurants Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredRestaurants.length} of {restaurants.length} restaurants
          </div>

          {/* Restaurants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <Building size={64} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">
                  {restaurants.length === 0 
                    ? "No restaurants found. Add your first restaurant!" 
                    : "No restaurants match your search criteria."}
                </p>
              </div>
            ) : (
              filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant._id || index}
                  restaurant={restaurant}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Reservations Tab */}
      {activeTab === "reservations" && (
        <div className="space-y-6">
          {/* Reservation Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total" value={reservationStats.total} color="gray" />
            <StatCard title="Confirmed" value={reservationStats.confirmed} color="green" />
            <StatCard title="Pending" value={reservationStats.pending} color="yellow" />
            <StatCard title="Cancelled" value={reservationStats.cancelled} color="red" />
            <StatCard title="Completed" value={reservationStats.completed} color="blue" />
          </div>

          {/* Reservation Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Status:</span>
              <select
                value={reservationFilter}
                onChange={(e) => setReservationFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-transparent w-full lg:w-auto"
              >
                <option value="all">All Reservations</option>
                {reservationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Restaurant Reservations</h2>
              <p className="text-gray-600 text-sm">Manage all restaurant bookings and reservations</p>
            </div>
            
            {filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No reservations found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {reservationFilter !== "all" ? `No ${reservationFilter} reservations` : "No reservations have been made yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restaurant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <ReservationRow
                        key={reservation._id}
                        reservation={reservation}
                        onStatusUpdate={updateReservationStatus}
                        getStatusColor={getReservationStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Restaurant Modal */}
      <RestaurantModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingRestaurant={editingRestaurant}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        cuisines={cuisines}
        priceRanges={priceRanges}
        statuses={statuses}
        error={error}
        imageUploading={imageUploading}
      />
    </div>
  );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant, index, onEdit, onDelete, getStatusColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
  >
    <div className="relative h-48 bg-gray-200 overflow-hidden">
      {restaurant.images?.[0] ? (
        <img
          src={restaurant.images[0]}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={48} className="text-gray-400" />
        </div>
      )}
      <div className="absolute top-3 right-3">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(restaurant.status)}`}>
          {restaurant.status?.replace("_", " ") || "active"}
        </span>
      </div>
      <div className="absolute bottom-3 left-3">
        <span className="bg-[#D4AF37] text-[#0A1F44] px-2 py-1 rounded-full text-xs font-semibold">
          {restaurant.cuisine}
        </span>
      </div>
    </div>

    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{restaurant.name}</h3>
        <div className="flex items-center gap-1 bg-[#D4AF37]/10 px-2 py-1 rounded-full ml-2">
          <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
          <span className="text-sm font-semibold text-gray-900">{restaurant.rating || "N/A"}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
        {restaurant.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate max-w-[120px]">{restaurant.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span>{restaurant.capacity} seats</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {restaurant.priceRange}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(restaurant)}
            className="text-gray-600 hover:text-[#D4AF37] transition-colors p-1.5 hover:bg-gray-100 rounded"
            title="Edit restaurant"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(restaurant._id)}
            className="text-gray-600 hover:text-red-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
            title="Delete restaurant"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

// Reservation Row Component
const ReservationRow = ({ reservation, onStatusUpdate, getStatusColor }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(reservation._id, newStatus);
    setIsUpdating(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {reservation.guestName || "Unknown Guest"}
            </div>
            <div className="text-sm text-gray-500">
              {reservation.guestEmail || "No email"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reservation.restaurantId?.name || "Restaurant"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString() : "No date"}
        </div>
        <div className="text-sm text-gray-500">
          {reservation.reservationTime || "No time"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {reservation.numberOfGuests || 0} guests
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
          {reservation.status || "unknown"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          {reservation.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={isUpdating}
                className="text-green-600 hover:text-green-800 disabled:opacity-50 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-50 transition-colors"
              >
                {isUpdating ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
              >
                {isUpdating ? "..." : "Cancel"}
              </button>
            </>
          )}
          {reservation.status === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              {isUpdating ? "..." : "Complete"}
            </button>
          )}
          {(reservation.status === 'cancelled' || reservation.status === 'completed') && (
            <span className="text-gray-400 text-xs">No actions</span>
          )}
        </div>
      </td>
    </tr>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm">
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-bold rounded-lg w-12 h-12 flex items-center justify-center mx-auto ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
};

// Restaurant Modal Component
const RestaurantModal = ({
  showModal, setShowModal, editingRestaurant, formData, setFormData,
  handleSubmit, resetForm, handleImageUpload, removeImage,
  cuisines, priceRanges, statuses, error, imageUploading
}) => {
  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Restaurant Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Restaurant ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors bg-gray-50">
                      {imageUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4AF37]"></div>
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-400 mb-1" />
                          <span className="text-sm text-gray-500">Add Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter restaurant name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type *
                    </label>
                    <select
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      {cuisines.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Describe the restaurant..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range *
                    </label>
                    <select
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      {priceRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="e.g., Ground Floor, Main Building"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors flex-1"
                  >
                    {editingRestaurant ? "Update Restaurant" : "Add Restaurant"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestaurantsManagement;