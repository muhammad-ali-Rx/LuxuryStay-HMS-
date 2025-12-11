"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Star,
  Edit,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const UserReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReservations();
  }, []);

  const fetchUserReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      console.log(
        "Fetching reservations with token:",
        token.substring(0, 20) + "..."
      );

      const response = await axios.get(
        "http://localhost:3000/reservations/my-reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Reservations response:", response.data);
      setReservations(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setLoading(false);
    }
  };
  const handleReservation = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Only add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
      'http://localhost:3000/reservations/create',
      formData,
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Reservation error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login or show message
      alert('Please log in to make a reservation, or ensure you have filled all guest details.');
    }
    
    throw error;
  }
};
  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3000/reservations/reservations/${reservationId}/cancel`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchUserReservations();
        alert("Reservation cancelled successfully");
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        alert("Error cancelling reservation");
      }
    }
  };

  const handleAddFeedback = async (reservationId, rating, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/reservations/reservations/${reservationId}/feedback`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUserReservations();
      alert("Feedback submitted successfully");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancel = (reservation) => {
    const reservationDateTime = new Date(
      `${reservation.reservationDate}T${reservation.reservationTime}`
    );
    const now = new Date();
    const hoursDifference = (reservationDateTime - now) / (1000 * 60 * 60);
    return (
      hoursDifference > 2 &&
      ["pending", "confirmed"].includes(reservation.status)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1F44] to-[#1a365d] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">My Reservations</h1>
          <p className="text-xl text-gray-300">
            Manage your restaurant bookings
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Reservations Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't made any restaurant reservations yet.
            </p>
            <button
              onClick={() => navigate("/restaurants")}
              className="bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors"
            >
              Explore Restaurants
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation, index) => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Restaurant Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            reservation.restaurant?.images?.[0] ||
                            "/api/placeholder/100/100"
                          }
                          alt={reservation.restaurant?.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {reservation.restaurant?.name}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {reservation.restaurant?.cuisine}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{reservation.restaurant?.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{reservation.reservationTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{reservation.partySize} people</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {reservation.status.replace("_", " ")}
                        </span>
                        {reservation.checkedIn && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(reservation.reservationDate)}
                      </p>
                      {reservation.assignedTable && (
                        <p className="text-sm text-gray-600">
                          Table: {reservation.assignedTable}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {reservation.specialRequests && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Special Requests:</strong>{" "}
                        {reservation.specialRequests}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                    {canCancel(reservation) && (
                      <button
                        onClick={() => handleCancelReservation(reservation._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle size={16} />
                        Cancel Reservation
                      </button>
                    )}

                    {reservation.status === "completed" &&
                      !reservation.feedback && (
                        <button
                          onClick={() => {
                            const rating = prompt(
                              "Rate your experience (1-5 stars):"
                            );
                            const comment = prompt("Any comments?");
                            if (rating && comment) {
                              handleAddFeedback(
                                reservation._id,
                                parseInt(rating),
                                comment
                              );
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A1F44] rounded-lg hover:bg-[#c19b2a] transition-colors"
                        >
                          <Star size={16} />
                          Add Feedback
                        </button>
                      )}

                    {reservation.feedback && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <Star size={16} className="fill-current" />
                        Rated {reservation.feedback.rating}/5
                      </div>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/restaurants/${reservation.restaurant?._id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit size={16} />
                      View Restaurant
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReservations;
