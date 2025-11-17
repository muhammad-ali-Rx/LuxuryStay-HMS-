"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "../ui/button";

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

  // Fetch all bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Fetching bookings from API...");

      // Get token from localStorage (assuming you're using the same auth system)
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/booking`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📨 API Response status:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error response:", errorText);
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API Response data:", result);

      if (result.success) {
        setBookings(result.data || []);
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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(bookingId);
      console.log("🔄 Updating booking status:", bookingId, newStatus);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update booking status");
      }

      const result = await response.json();

      if (result.success) {
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setActionLoading(`checkin-${bookingId}`);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/check-in`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in");
      }

      const result = await response.json();

      if (result.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: "checked-in" }
              : booking
          )
        );
        alert("✅ Guest checked in successfully!");
      } else {
        throw new Error(result.message || "Failed to check in");
      }
    } catch (error) {
      console.error("❌ Error during check-in:", error);
      alert(`❌ ${error.message || "Failed to check in"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      setActionLoading(`checkout-${bookingId}`);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/check-out`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check out");
      }

      const result = await response.json();

      if (result.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: "checked-out" }
              : booking
          )
        );
        alert("✅ Guest checked out successfully!");
      } else {
        throw new Error(result.message || "Failed to check out");
      }
    } catch (error) {
      console.error("❌ Error during check-out:", error);
      alert(`❌ ${error.message || "Failed to check out"}`);
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
      console.log("🗑️ Cancelling booking:", bookingId);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/booking/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      const result = await response.json();

      if (result.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: "cancelled" }
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
        return "bg-green-100 text-green-800 border border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "checked-in":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "checked-out":
      case "completed":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
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

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "checked-in", label: "Checked In" },
    { value: "checked-out", label: "Checked Out" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Get available actions based on current status
  const getAvailableActions = (booking) => {
    const actions = [];

    switch (booking.bookingStatus) {
      case "pending":
        actions.push({
          label: "Confirm",
          action: () => handleUpdateStatus(booking._id, "confirmed"),
          icon: CheckCircle,
          color: "text-green-600 hover:bg-green-100",
        });
        break;
      case "confirmed":
        actions.push({
          label: "Check In",
          action: () => handleCheckIn(booking._id),
          icon: User,
          color: "text-blue-600 hover:bg-blue-100",
        });
        break;
      case "checked-in":
        actions.push({
          label: "Check Out",
          action: () => handleCheckOut(booking._id),
          icon: Bed,
          color: "text-purple-600 hover:bg-purple-100",
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
        color: "text-red-600 hover:bg-red-100",
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-[#0A1F44]">
          Bookings Management
        </h2>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader className="animate-spin text-[#D4AF37]" size={48} />
          <p className="text-gray-600">Loading bookings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0A1F44]">
            Bookings Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage all hotel bookings and reservations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportBookings}
            variant="outline"
            className="flex items-center gap-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
            disabled={bookings.length === 0}
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button
            onClick={fetchBookings}
            variant="outline"
            className="flex items-center gap-2 border-[#0A1F44] text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters - FIXED: Removed labels from icons */}
      {/* Search and Filters - FIXED: Icons properly centered */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search - FIXED: Icon properly centered */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2/7  transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Guest name, room, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Status Filter - FIXED: Icon properly centered */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none bg-white cursor-pointer transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a6d] rounded-lg p-4 text-center text-white shadow-md">
            <p className="text-sm opacity-90">Total Bookings</p>
            <p className="text-2xl font-bold">{filteredBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <p className="font-semibold">Error Loading Bookings</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={fetchBookings}
            variant="outline"
            className="mt-3 bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Bookings Table */}
      {!error && (
        <>
          {filteredBookings.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a6d] text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        Guest Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Room
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Check-In
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Check-Out
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Guests
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, idx) => {
                      const nights = calculateNights(
                        booking.checkInDate,
                        booking.checkOutDate
                      );
                      const availableActions = getAvailableActions(booking);

                      return (
                        <motion.tr
                          key={booking._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-semibold text-[#0A1F44]">
                            {booking.guestDetails?.name || "Unknown Guest"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Room {booking.roomNumber || "N/A"}
                              </span>
                              {booking.roomType && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border">
                                  {booking.roomType}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDate(booking.checkInDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDate(booking.checkOutDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gray-400" />
                              {booking.numberOfGuests || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                booking.bookingStatus
                              )}`}
                            >
                              {booking.bookingStatus || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#D4AF37]">
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} />
                              {booking.totalAmount || 0}
                              <span className="text-xs text-gray-500 ml-1">
                                ({nights} nights)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewDetails(booking)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </motion.button>

                              {availableActions.map((action, index) => (
                                <motion.button
                                  key={index}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={action.action}
                                  disabled={
                                    actionLoading ===
                                    `${action.label.toLowerCase()}-${
                                      booking._id
                                    }`
                                  }
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    action.color
                                  } ${
                                    actionLoading ===
                                    `${action.label.toLowerCase()}-${
                                      booking._id
                                    }`
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:scale-105"
                                  }`}
                                  title={action.label}
                                >
                                  {actionLoading ===
                                  `${action.label.toLowerCase()}-${
                                    booking._id
                                  }` ? (
                                    <Loader
                                      size={18}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <action.icon size={18} />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2 font-medium">
                {bookings.length === 0
                  ? "No bookings found in the system"
                  : "No bookings match your search criteria"}
              </p>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                {bookings.length === 0
                  ? "Bookings will appear here once guests make reservations"
                  : "Try adjusting your search terms or filters"}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("");
                }}
                className="bg-[#0A1F44] hover:bg-[#1a3a6d] transition-colors"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-[#0A1F44]">
                Booking Details
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guest Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">
                  Guest Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.guestDetails?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.guestDetails?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.guestDetails?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">
                  Booking Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                    <p className="font-medium text-sm text-gray-900 font-mono">
                      {selectedBooking._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room</p>
                    <p className="font-medium text-gray-900">
                      Room {selectedBooking.roomNumber} -{" "}
                      {selectedBooking.roomType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-medium text-gray-900">
                      {calculateNights(
                        selectedBooking.checkInDate,
                        selectedBooking.checkOutDate
                      )}{" "}
                      nights
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedBooking.bookingStatus
                      )}`}
                    >
                      {selectedBooking.bookingStatus || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">
                  Dates
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedBooking.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedBooking.checkOutDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedBooking.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-lg">
                  Payment
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-medium text-[#D4AF37] flex items-center gap-1 text-lg">
                      <DollarSign size={18} />
                      {selectedBooking.totalAmount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedBooking.paymentStatus || "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guests</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.numberOfGuests || 0} guests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {selectedBooking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Special Requests
                </h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedBooking.specialRequests}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
