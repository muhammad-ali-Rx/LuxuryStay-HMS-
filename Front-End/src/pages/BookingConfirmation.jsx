import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle, Download, Mail, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";


export default function ConfirmationPage() {
  const { state } = useLocation();
  const bookingData = state?.bookingData;
  const bookingId = "LUX-2025-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const confirmationEmail = "john@example.com";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 px-4 bg-gradient-to-br from-primary to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="heading-xl text-white mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-white/80">Your reservation has been successfully completed</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="bg-card rounded-lg p-8 shadow-lg mb-8">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle size={64} className="text-accent" />
          </div>

          <div className="text-center mb-8">
            <h2 className="heading-md text-2xl mb-2">Thank You for Your Booking!</h2>
            <p className="text-lg text-muted mb-4">
              A confirmation email has been sent to{" "}
              <span className="font-semibold">{confirmationEmail}</span>
            </p>
            <p className="text-sm text-muted">
              Your booking reference:{" "}
              <span className="font-mono font-bold text-primary">{bookingId}</span>
            </p>
          </div>

          {/* Booking Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="font-semibold text-primary mb-4">Booking Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted">Check-in</p>
                  <p className="font-semibold">December 15, 2025</p>
                </div>
                <div>
                  <p className="text-muted">Check-out</p>
                  <p className="font-semibold">December 18, 2025</p>
                </div>
                <div>
                  <p className="text-muted">Duration</p>
                  <p className="font-semibold">3 nights</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="font-semibold text-primary mb-4">Room Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted">Room Type</p>
                  <p className="font-semibold">Deluxe Suite</p>
                </div>
                <div>
                  <p className="text-muted">Guests</p>
                  <p className="font-semibold">2 Guests</p>
                </div>
                <div>
                  <p className="text-muted">Room Number</p>
                  <p className="font-semibold">Suite 1205</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-secondary p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-primary mb-4">Price Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Room Rate (3 nights × $450)</span>
                <span className="font-semibold">$1,350</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Taxes & Fees</span>
                <span className="font-semibold">$135</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold">Total Amount Paid</span>
                <span className="text-2xl font-bold text-accent">$1,485</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-secondary p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-primary mb-4">Guest Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted">Name</p>
                <p className="font-semibold">John Doe</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <p className="font-semibold">{confirmationEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <p className="font-semibold">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-accent/10 border border-accent rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-primary mb-4">Important Information</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Check-in time: 3:00 PM | Check-out time: 11:00 AM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Free cancellation up to 48 hours before check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Complimentary breakfast included with your stay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Airport transfer available upon request</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 px-4 rounded-md hover:bg-accent/90 transition">
              <Download size={20} />
              Download Confirmation
            </button>

            <a
              href="/"
              className="flex-1 text-center border border-gray-300 py-3 px-4 rounded-md hover:bg-gray-100 transition"
            >
              Back to Home
            </a>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-card rounded-lg p-8 text-center">
          <h3 className="heading-sm text-lg mb-4">Need Help?</h3>
          <p className="text-muted mb-6">
            If you have any questions about your booking, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="flex items-center justify-center gap-2 text-accent hover:text-accent/80"
            >
              <Phone size={20} />
              +1 (555) 123-4567
            </a>
            <a
              href="mailto:support@luxurystay.com"
              className="flex items-center justify-center gap-2 text-accent hover:text-accent/80"
            >
              <Mail size={20} />
              support@luxurystay.com
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
