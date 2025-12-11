import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronRight, Calendar, Users, Loader } from "lucide-react";
import { Button } from "../components/UI/button";
import { useAuth } from "./../context/AuthContext";

const API_BASE_URL = "http://localhost:3000/booking";

export default function Booking() {
  const navigate = useNavigate();
  const { isAuthenticated, userAuth, getToken, logoutUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    roomType: "",
    roomId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  // Initialize form data with user info when userAuth is available
  useEffect(() => {
    if (userAuth) {
      const nameParts = userAuth.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userAuth.email || "",
        phone: userAuth.phone || "",
      }));
    }
  }, [userAuth]);

  // Fetch available rooms when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      fetchAvailableRooms();
    }
  }, [formData.checkIn, formData.checkOut, formData.guests]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/available-rooms?checkInDate=${formData.checkIn}&checkOutDate=${formData.checkOut}&guests=${formData.guests}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available rooms");
      }

      const data = await response.json();
      setAvailableRooms(data.data || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      alert("Error fetching available rooms");
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const selectedRoom = availableRooms.find(
    (room) => room._id === formData.roomId
  );
  const totalPrice = nights * (selectedRoom?.pricePerNight || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room) => {
    setFormData((prev) => ({
      ...prev,
      roomType: room.roomType,
      roomId: room._id,
    }));
  };

  const isStep1Valid =
    formData.checkIn && formData.checkOut && formData.guests && nights > 0;
  const isStep2Valid = formData.roomId;
  const isStep3Valid =
    formData.firstName && formData.lastName && formData.email && formData.phone;

  const handleNextStep = () => {
    if (step === 1 && isStep1Valid) setStep(2);
    else if (step === 2 && isStep2Valid) setStep(3);
    else if (step === 3 && isStep3Valid) {
      handleSubmitBooking();
    }
  };

  const handleSubmitBooking = async () => {
    console.log("🔐 Auth Status:", {
      isAuthenticated,
      userAuth,
      hasToken: !!getToken(),
    });

    if (!isAuthenticated || !userAuth) {
      alert("Please login to book a room");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      console.log(
        "📝 Token for booking:",
        token ? `${token.substring(0, 20)}...` : "NULL"
      );

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const bookingData = {
        roomId: formData.roomId,
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        numberOfGuests: parseInt(formData.guests),
        specialRequests: formData.specialRequests,
      };

      console.log("🚀 Sending booking request with data:", bookingData);

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log("📨 Response status:", response.status);

      if (response.status === 401) {
        // Token is invalid, clear it and redirect to login
        logoutUser();
        alert("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Booking failed with status: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("✅ Booking successful:", result);

      // ✅ FIX: Wait for state to update before navigation
      setTimeout(() => {
        alert("Booking request submitted successfully!");

        // ✅ FIX: Use the correct path and ensure data is passed properly
        navigate("/BookingConfirmation", {
          state: {
            booking: {
              ...formData,
              checkInDate: formData.checkIn, // Make sure these are proper date strings
              checkOutDate: formData.checkOut,
              numberOfGuests: parseInt(formData.guests),
            },
            room: selectedRoom,
            nights: nights,
            totalPrice: totalPrice,
            bookingId: result.data._id,
          },
        });
      }, 100);
    } catch (error) {
      console.error("❌ Booking error:", error);
      alert(error.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if room is available for selected guests
  const isRoomAvailableForGuests = (room) => {
    return room.capacity >= parseInt(formData.guests);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 px-4 bg-gradient-to-br from-primary to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Book Your Stay</h1>
          <p className="text-xl text-white/80">Step {step} of 3</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2">
            {/* Step 1: Dates & Guests */}
            {step === 1 && (
              <div className="bg-card rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">
                  Select Your Dates
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Check-in Date
                    </label>
                    <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
                      <Calendar size={20} className="text-accent" />
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex-1 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Check-out Date
                    </label>
                    <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
                      <Calendar size={20} className="text-accent" />
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        min={
                          formData.checkIn ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="flex-1 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
                      <Users size={20} className="text-accent" />
                      <select
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted">Total nights</p>
                      <p className="text-2xl font-bold text-primary">
                        {nights} nights
                      </p>
                    </div>
                  )}

                  {formData.checkIn && formData.checkOut && nights <= 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      Check-out date must be after check-in date
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleNextStep}
                  disabled={!isStep1Valid || loading}
                  className="w-full mt-8"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    "Continue"
                  )}
                  {!loading && <ChevronRight size={20} />}
                </Button>
              </div>
            )}

            {/* Step 2: Room Selection */}
            {step === 2 && (
              <div className="bg-card rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">
                  Select Your Room
                </h2>

                {loading ? (
                  <div className="text-center py-8">
                    <Loader className="animate-spin mx-auto mb-4" size={32} />
                    <p>Loading available rooms...</p>
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted mb-4">
                      No rooms available for selected dates
                    </p>
                    <Button onClick={() => setStep(1)} variant="outline">
                      Change Dates
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-8">
                      {availableRooms.map((room) => (
                        <div
                          key={room._id}
                          onClick={() =>
                            isRoomAvailableForGuests(room) &&
                            handleRoomSelect(room)
                          }
                          className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            formData.roomId === room._id
                              ? "border-accent bg-accent/10 scale-[1.02]"
                              : isRoomAvailableForGuests(room)
                              ? "border-border hover:border-accent/50 hover:scale-[1.01]"
                              : "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {room.roomType}
                              </h3>
                              <p className="text-sm text-muted mb-1">
                                Room {room.roomNumber} • {room.capacity} guests
                                max
                              </p>
                              <p className="text-sm text-muted mb-3">
                                {room.amenities?.slice(0, 3).join(" • ")}
                              </p>
                              {!isRoomAvailableForGuests(room) && (
                                <p className="text-sm text-red-500">
                                  Not available for {formData.guests} guests
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-accent">
                                ₹{room.pricePerNight}
                              </p>
                              <p className="text-xs text-muted">per night</p>
                            </div>
                          </div>

                          {formData.roomId === room._id && (
                            <div className="mt-4 pt-4 border-t border-accent">
                              <p className="text-sm font-semibold text-accent">
                                Total: ₹{nights * room.pricePerNight} for{" "}
                                {nights} nights
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        disabled={!isStep2Valid || loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          "Continue"
                        )}
                        {!loading && <ChevronRight size={20} />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Guest Information */}
            {step === 3 && (
              <div className="bg-card rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">
                  Guest Information
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-primary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-secondary p-3 rounded-lg outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-primary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-secondary p-3 rounded-lg outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-secondary p-3 rounded-lg outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-secondary p-3 rounded-lg outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-primary mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full bg-secondary p-3 rounded-lg outline-none"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStep3Valid || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin mr-2" size={20} />
                        Processing...
                      </>
                    ) : (
                      "Complete Booking"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24 shadow-lg">
              <h3 className="text-lg font-semibold mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {formData.checkIn && (
                  <div>
                    <p className="text-sm text-muted">Check-in</p>
                    <p className="font-semibold">
                      {new Date(formData.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {formData.checkOut && (
                  <div>
                    <p className="text-sm text-muted">Check-out</p>
                    <p className="font-semibold">
                      {new Date(formData.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {nights > 0 && (
                  <div>
                    <p className="text-sm text-muted">Duration</p>
                    <p className="font-semibold">{nights} nights</p>
                  </div>
                )}

                {selectedRoom && (
                  <div>
                    <p className="text-sm text-muted">Room</p>
                    <p className="font-semibold">{selectedRoom.roomType}</p>
                    <p className="text-xs text-muted">
                      Room {selectedRoom.roomNumber}
                    </p>
                  </div>
                )}

                {formData.guests && (
                  <div>
                    <p className="text-sm text-muted">Guests</p>
                    <p className="font-semibold">
                      {formData.guests}{" "}
                      {formData.guests === 1 ? "Guest" : "Guests"}
                    </p>
                  </div>
                )}
              </div>

              {selectedRoom && nights > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted">
                      ₹{selectedRoom.pricePerNight} × {nights} nights
                    </span>
                    <span className="font-semibold">
                      ₹{nights * selectedRoom.pricePerNight}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-muted">
                    <span>Taxes & Fees (10%)</span>
                    <span>₹{Math.round(totalPrice * 0.1)}</span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      ₹{totalPrice + Math.round(totalPrice * 0.1)}
                    </span>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please login to complete your booking
                  </p>
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
