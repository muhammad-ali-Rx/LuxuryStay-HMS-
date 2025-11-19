"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Loader,
  RefreshCw,
  User,
  Bed,
  ChevronDown,
  Clock,
  Shield,
  Phone,
  Mail,
  ArrowUpDown,
  Building,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch all bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("🔍 Fetching bookings...");
      const response = await fetch(`${API_BASE_URL}/booking`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 API Response:", result);

      if (result.success) {
        setBookings(result.data || []);
        console.log("✅ Bookings loaded:", result.data?.length || 0);
      } else {
        throw new Error(result.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ FIXED: Changed 'status' to 'bookingStatus' to match backend
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(bookingId);
      console.log(`🔄 Updating booking ${bookingId} to ${newStatus}`);
      
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // ✅ FIX: Changed 'status' to 'bookingStatus'
          body: JSON.stringify({ bookingStatus: newStatus }),
        }
      );

      console.log("📡 Status update response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Status update error:", errorText);
        throw new Error(`Failed to update booking status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Status update result:", result);

      if (result.success) {
        // Update local state immediately
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: newStatus }
              : booking
          )
        );
        
        alert(`✅ Booking status updated to ${newStatus}`);
      } else {
        throw new Error(result.message || "Failed to update booking status");
      }
    } catch (error) {
      console.error("❌ Error updating booking status:", error);
      alert(`❌ ${error.message || "Failed to update booking status"}`);
      
      // Refresh data to show correct status
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setActionLoading(`checkin-${bookingId}`);
      console.log(`🔄 Checking in booking ${bookingId}`);
      
      const token = localStorage.getItem("authToken");
      
      // ✅ FIX: Use the status update endpoint with 'checked-in' status
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingStatus: 'checked-in' }),
        }
      );

      console.log("📡 Check-in response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Check-in error:", errorText);
        throw new Error(`Failed to check in: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Check-in result:", result);

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: 'checked-in' }
              : booking
          )
        );
        alert("✅ Check-in successful!");
      } else {
        throw new Error(result.message || "Failed to check in");
      }
    } catch (error) {
      console.error("❌ Error during check-in:", error);
      alert(`❌ ${error.message || "Failed to check in"}`);
      
      // Refresh data to show correct status
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      setActionLoading(`checkout-${bookingId}`);
      console.log(`🔄 Checking out booking ${bookingId}`);
      
      const token = localStorage.getItem("authToken");
      
      // ✅ FIX: Use the status update endpoint with 'checked-out' status
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingStatus: 'checked-out' }),
        }
      );

      console.log("📡 Check-out response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Check-out error:", errorText);
        throw new Error(`Failed to check out: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Check-out result:", result);

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: 'checked-out' }
              : booking
          )
        );
        alert("✅ Check-out successful!");
      } else {
        throw new Error(result.message || "Failed to check out");
      }
    } catch (error) {
      console.error("❌ Error during check-out:", error);
      alert(`❌ ${error.message || "Failed to check out"}`);
      
      // Refresh data to show correct status
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setActionLoading(`cancel-${bookingId}`);
      console.log(`🔄 Cancelling booking ${bookingId}`);
      
      const token = localStorage.getItem("authToken");
      
      // ✅ FIX: Use the status update endpoint with 'cancelled' status
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingStatus: 'cancelled' }),
        }
      );

      console.log("📡 Cancel response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Cancel error:", errorText);
        throw new Error(`Failed to cancel booking: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Cancel result:", result);

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: 'cancelled' }
              : booking
          )
        );
        alert("✅ Booking cancelled successfully!");
      } else {
        throw new Error(result.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("❌ Error cancelling booking:", error);
      alert(`❌ ${error.message || "Failed to cancel booking"}`);
      
      // Refresh data to show correct status
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleExportBookings = () => {
    if (bookings.length === 0) {
      alert("No bookings data to export");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Booking ID,Guest Name,Room,Check-In,Check-Out,Guests,Status,Total Amount,Booking Date,Payment Status\n" +
      bookings
        .map(
          (booking) =>
            `"${booking._id}","${booking.guestDetails?.name || "N/A"}","${
              booking.roomNumber || "N/A"
            }","${booking.checkInDate || "N/A"}","${
              booking.checkOutDate || "N/A"
            }","${booking.numberOfGuests || 0}","${
              booking.bookingStatus || "pending"
            }","${booking.totalAmount || 0}","${
              booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString()
                : "Unknown"
            }","${booking.paymentStatus || "pending"}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bookings_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );
      return nights > 0 ? nights : 0;
    } catch (error) {
      return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
        return "bg-emerald-500/15 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-500/15 text-amber-700 border border-amber-200";
      case "checked-in":
        return "bg-blue-500/15 text-blue-700 border border-blue-200";
      case "checked-out":
      case "completed":
        return "bg-purple-500/15 text-purple-700 border border-purple-200";
      case "cancelled":
      case "rejected":
        return "bg-rose-500/15 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-500/15 text-gray-700 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={14} className="text-emerald-600" />;
      case "pending":
        return <Clock size={14} className="text-amber-600" />;
      case "checked-in":
        return <User size={14} className="text-blue-600" />;
      case "checked-out":
        return <Shield size={14} className="text-purple-600" />;
      case "cancelled":
        return <XCircle size={14} className="text-rose-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.guestDetails?.name &&
        booking.guestDetails.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (booking.roomNumber && booking.roomNumber.includes(searchTerm)) ||
      (booking._id &&
        booking._id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      !filterStatus ||
      (booking.bookingStatus &&
        booking.bookingStatus.toLowerCase() === filterStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle nested properties
    if (sortConfig.key === 'guestDetails.name') {
      aValue = a.guestDetails?.name;
      bValue = b.guestDetails?.name;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get available actions based on current status
  const getAvailableActions = (booking) => {
    const actions = [];

    switch (booking.bookingStatus) {
      case "pending":
        actions.push({
          label: "Confirm",
          action: () => handleUpdateStatus(booking._id, "confirmed"),
          icon: CheckCircle,
          color: "bg-emerald-500 hover:bg-emerald-600 text-white",
        });
        break;
      case "confirmed":
        actions.push({
          label: "Check In",
          action: () => handleCheckIn(booking._id),
          icon: User,
          color: "bg-blue-500 hover:bg-blue-600 text-white",
        });
        break;
      case "checked-in":
        actions.push({
          label: "Check Out",
          action: () => handleCheckOut(booking._id),
          icon: Bed,
          color: "bg-purple-500 hover:bg-purple-600 text-white",
        });
        break;
    }

    // Always allow cancellation for pending and confirmed bookings
    if (
      booking.bookingStatus === "pending" ||
      booking.bookingStatus === "confirmed"
    ) {
      actions.push({
        label: "Cancel",
        action: () => handleCancelBooking(booking._id),
        icon: XCircle,
        color: "bg-rose-500 hover:bg-rose-600 text-white",
      });
    }

    return actions;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.bookingStatus === "pending").length,
    confirmed: bookings.filter(b => b.bookingStatus === "confirmed").length,
    checkedIn: bookings.filter(b => b.bookingStatus === "checked-in").length,
    revenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#0A1F44] border-t-transparent rounded-full mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Bookings</h3>
            <p className="text-gray-600">Fetching your booking data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Full width container - NO EMPTY SIDES */}
      <div className="w-full space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bookings Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all hotel bookings and reservations
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportBookings}
              disabled={bookings.length === 0}
              className="flex items-center gap-2 bg-white text-[#0A1F44] px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBookings}
              className="flex items-center gap-2 bg-[#0A1F44] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#00326f] transition-all duration-300"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {[
            { label: "Total", value: stats.total, color: "gray", icon: <Calendar size={18} /> },
            { label: "Pending", value: stats.pending, color: "amber", icon: <Clock size={18} /> },
            { label: "Confirmed", value: stats.confirmed, color: "emerald", icon: <CheckCircle size={18} /> },
            { label: "Checked In", value: stats.checkedIn, color: "blue", icon: <User size={18} /> },
            { label: "Revenue", value: `$${stats.revenue}`, color: "purple", icon: <DollarSign size={18} /> },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                  {stat.icon}
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none bg-white cursor-pointer transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0A1F44] to-[#00326f] rounded-lg p-3 text-white">
              <div>
                <p className="text-xs opacity-90">Showing</p>
                <p className="text-lg font-bold">{filteredBookings.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90">Filtered</p>
                <p className="text-sm font-semibold">
                  {filterStatus ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) : 'All'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-800">Error Loading Bookings</p>
                <p className="text-rose-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchBookings}
              className="mt-3 bg-rose-100 text-rose-700 px-3 py-1.5 rounded text-sm font-semibold hover:bg-rose-200 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Bookings Table - FULL WIDTH */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full"
          >
            {sortedBookings.length > 0 ? (
              <div className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0A1F44] to-[#00326f] text-white">
                      <th 
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort('guestDetails.name')}
                      >
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Guest
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <Building size={16} />
                          Room
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort('checkInDate')}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Check-In
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Check-Out
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Guests
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <Shield size={16} />
                          Status
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort('totalAmount')}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          Amount
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((booking, idx) => {
                      const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
                      const availableActions = getAvailableActions(booking);

                      return (
                        <motion.tr
                          key={booking._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        >
                          {/* Guest Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0A1F44] to-[#00326f] rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                {booking.guestDetails?.name?.charAt(0) || "G"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {booking.guestDetails?.name || "Unknown Guest"}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {booking.guestDetails?.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Room Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                Room {booking.roomNumber || "N/A"}
                              </p>
                              {booking.roomType && (
                                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                  {booking.roomType}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Check-in Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {formatDate(booking.checkInDate)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.checkInDate ? new Date(booking.checkInDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>
                          </td>

                          {/* Check-out Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {formatDate(booking.checkOutDate)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>
                          </td>

                          {/* Guests Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {booking.numberOfGuests || 0}
                              </span>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(booking.bookingStatus)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                {booking.bookingStatus || "pending"}
                              </span>
                            </div>
                          </td>

                          {/* Amount Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-bold text-[#0A1F44] flex items-center gap-1">
                                <DollarSign size={16} />
                                {booking.totalAmount || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                {nights} night{nights !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* View Details Button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewDetails(booking)}
                                className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600 hover:text-blue-700"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </motion.button>

                              {/* Action Buttons */}
                              <div className="flex gap-1">
                                {availableActions.map((action, index) => (
                                  <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={action.action}
                                    disabled={actionLoading === `${action.label.toLowerCase()}-${booking._id}`}
                                    className={`px-3 py-2 rounded text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${action.color} ${
                                      actionLoading === `${action.label.toLowerCase()}-${booking._id}`
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:shadow-md"
                                    }`}
                                    title={action.label}
                                  >
                                    {actionLoading === `${action.label.toLowerCase()}-${booking._id}` ? (
                                      <Loader size={14} className="animate-spin" />
                                    ) : (
                                      <action.icon size={14} />
                                    )}
                                    <span>{action.label}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {bookings.length === 0 ? "No Bookings Yet" : "No Matching Bookings"}
                </h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                  {bookings.length === 0
                    ? "Get started by accepting your first booking."
                    : "Try adjusting your search terms or filters."}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("");
                  }}
                  className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#00326f] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Booking Details Modal */}
        <AnimatePresence>
          {showModal && selectedBooking && (
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
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-8 pb-6 rounded-t-3xl z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Booking Details
                      </h3>
                      <p className="text-gray-600">
                        Complete information for booking #{selectedBooking._id?.slice(-8)}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowModal(false);
                        setSelectedBooking(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-3 hover:bg-gray-100 rounded-2xl"
                    >
                      <XCircle size={28} />
                    </motion.button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Guest Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Guest Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#0A1F44] to-[#00326f] rounded-2xl flex items-center justify-center text-white font-semibold text-2xl">
                            {selectedBooking.guestDetails?.name?.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">
                              {selectedBooking.guestDetails?.name || "Unknown Guest"}
                            </p>
                            <p className="text-gray-600">{selectedBooking.guestDetails?.email || "No email"}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Phone Number</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Phone size={16} />
                              {selectedBooking.guestDetails?.phone || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Booking ID</p>
                            <p className="font-medium text-gray-900 font-mono text-sm">
                              {selectedBooking._id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Booking Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Room</p>
                            <p className="font-medium text-gray-900">
                              Room {selectedBooking.roomNumber}
                            </p>
                            <p className="text-sm text-gray-500">{selectedBooking.roomType}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium text-gray-900">
                              {calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)} nights
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Check-in</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />
                              {formatDate(selectedBooking.checkInDate)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Check-out</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />
                              {formatDate(selectedBooking.checkOutDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Payment Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#0A1F44] to-[#00326f] rounded-2xl text-white">
                          <div>
                            <p className="text-sm opacity-90">Total Amount</p>
                            <p className="text-2xl font-bold">${selectedBooking.totalAmount || 0}</p>
                          </div>
                          <DollarSign size={32} className="opacity-80" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={14} />
                              {selectedBooking.paymentStatus || "pending"}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Guests</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Users size={16} />
                              {selectedBooking.numberOfGuests || 0} guests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Booking Status
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                          {getStatusIcon(selectedBooking.bookingStatus)}
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {selectedBooking.bookingStatus || "pending"}
                            </p>
                            <p className="text-sm text-gray-600">Current booking status</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Booking Date</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedBooking.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Special Requests */}
                  {selectedBooking.specialRequests && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900">Special Requests</h4>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedBooking.specialRequests}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-8 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Close Details
                    </button>
                    {getAvailableActions(selectedBooking).map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${action.color}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}