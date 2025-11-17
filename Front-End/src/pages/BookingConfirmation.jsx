import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle, Calendar, Users, Home, List } from "lucide-react";
import { Button } from "../components/UI/button";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  console.log("📋 Confirmation page state:", state);

  // If no state, redirect back
  if (!state) {
    console.log("❌ No booking data found, redirecting...");
    navigate('/booking');
    return null;
  }

  const { booking, room, nights, totalPrice, bookingId } = state;

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // Format booking ID for display
  const formatBookingId = (id) => {
    if (!id) return "N/A";
    return id.length > 12 ? `${id.substring(0, 12)}...` : id;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-32 pb-16 px-4 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed! 🎉</h1>
          <p className="text-xl text-gray-600 mb-2">Your booking request has been submitted successfully</p>
          <p className="text-green-600 font-semibold">Status: Pending Approval</p>
        </div>
      </div>

      {/* Booking Details Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Booking Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary to-blue-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                <p className="text-blue-100 mt-1">Booking ID: {formatBookingId(bookingId)}</p>
              </div>
              
              {/* Card Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Check-in Date</h3>
                        <p className="text-gray-900 font-medium">{formatDate(booking?.checkInDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Check-out Date</h3>
                        <p className="text-gray-900 font-medium">{formatDate(booking?.checkOutDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Guests</h3>
                        <p className="text-gray-900 font-medium">
                          {booking?.numberOfGuests || 0} {booking?.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Room Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900">{room?.roomType || 'Room'}</p>
                        <p className="text-gray-600">Room {room?.roomNumber || 'N/A'}</p>
                        {room?.amenities && (
                          <p className="text-sm text-gray-500 mt-2">
                            Amenities: {room.amenities.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Duration</h3>
                      <p className="text-2xl font-bold text-accent">{nights || 0} Nights</p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking?.specialRequests && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-3">Special Requests</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Room Price</span>
                  <span className="font-semibold">₹{room?.pricePerNight || 0}/night</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{nights || 0} nights</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Room Total</span>
                  <span className="font-semibold">₹{totalPrice || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold">₹{Math.round((totalPrice || 0) * 0.1)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-accent">
                    ₹{Math.round((totalPrice || 0) * 1.1)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-3"></div>
                  <div>
                    <p className="font-semibold text-yellow-800">Pending Approval</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Your booking will be confirmed within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <Button
                  onClick={() => navigate('/')}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Button>
                
                <Button
                  onClick={() => navigate('/my-bookings')}
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <List className="w-5 h-5" />
                  View My Bookings
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Need help? Contact us at{" "}
                  <a href="mailto:support@luxurystay.com" className="text-primary hover:underline">
                    support@luxurystay.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What Happens Next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Approval Process</h4>
              <p className="text-sm text-gray-600">Our team will review your booking request within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Confirmation</h4>
              <p className="text-sm text-gray-600">You'll receive a confirmation email once approved</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
              <p className="text-sm text-gray-600">Payment instructions will be sent with your confirmation</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}