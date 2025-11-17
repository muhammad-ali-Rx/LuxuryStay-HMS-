"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState("idle")

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a subject"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setSubmitStatus("error")
      return
    }

    setIsLoading(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch('http://localhost:5000/form/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message')
      }

      setSubmitStatus("success")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-[#1D293D] via-[#1D293D] to-[#2D3B52]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Contact us for reservations, inquiries, or feedback.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 px-4 -mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-[#1D293D]/10 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-[#1D293D] to-[#2D3B52] p-12 text-white">
                <h2 className="text-4xl font-bold mb-10">Contact Information</h2>
                <p className="text-white/80 text-lg mb-10 leading-relaxed">
                  Reach out to us through any of these channels. We're here to help you with all your luxury stay needs.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Phone className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-2">Phone</h3>
                      <p className="text-white/80">+92 (21) 111 505 505</p>
                      <p className="text-white/80">+92 (21) 356 300 00</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Mail className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-2">Email</h3>
                      <p className="text-white/80">info@luxurystay.com</p>
                      <p className="text-white/80">reservations@luxurystay.com</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <MapPin className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-2">Address</h3>
                      <p className="text-white/80">PC Hotel, Club Road</p>
                      <p className="text-white/80">Karachi, Pakistan 74000</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <Clock className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-2">Hours</h3>
                      <p className="text-white/80">Monday - Friday: 8:00 AM - 8:00 PM</p>
                      <p className="text-white/80">Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="mt-12 h-48 bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.834665766203!2d67.064258975456!3d24.813217547777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33c5369ff7ef9%3A0x81691b35d6f60959!2sPC%20Hotel%20Karachi!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="PC Hotel Karachi Location"
                    className="rounded-xl"
                  />
                </div>

                {/* Map Directions */}
                <div className="mt-4 text-center">
                  <a 
                    href="https://maps.google.com/maps?q=PC+Hotel+Karachi+Club+Road+Karachi+Pakistan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                  >
                    <MapPin size={16} />
                    Get Directions to PC Hotel
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-12">
                <h2 className="text-4xl font-bold text-[#1D293D] mb-10">Send us a Message</h2>

                {submitStatus === "success" && (
                  <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-xl flex gap-4 items-start">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={22} />
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Message Sent Successfully!</h3>
                      <p className="text-green-700">Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && Object.keys(errors).length > 0 && (
                  <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex gap-4 items-start">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                    <div>
                      <h3 className="font-semibold text-red-900 text-lg">Please fix the errors below</h3>
                      <p className="text-red-700">Check all required fields and try again.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid md:grid-cols-2 gap-7">
                    {/* Name Field */}
                    <div>
                      <label className="block text-[#1D293D] font-semibold mb-3 text-lg">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          errors.name
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-[#1D293D]/20 focus:border-[#1D293D] bg-white hover:border-[#1D293D]/40"
                        }`}
                        placeholder="Your full name"
                        disabled={isLoading}
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-2 font-medium">{errors.name}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-[#1D293D] font-semibold mb-3 text-lg">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-[#1D293D]/20 focus:border-[#1D293D] bg-white hover:border-[#1D293D]/40"
                        }`}
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-2 font-medium">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-[#1D293D] font-semibold mb-3 text-lg">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-[#1D293D]/20 focus:border-[#1D293D] bg-white hover:border-[#1D293D]/40"
                      }`}
                      placeholder="+92 300 1234567"
                      disabled={isLoading}
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-2 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-[#1D293D] font-semibold mb-3 text-lg">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 appearance-none ${
                        errors.subject
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-[#1D293D]/20 focus:border-[#1D293D] bg-white hover:border-[#1D293D]/40"
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select a subject</option>
                      <option value="reservation">Reservation Inquiry</option>
                      <option value="dining">Dining Reservation</option>
                      <option value="event">Event Booking</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="text-red-600 text-sm mt-2 font-medium">{errors.subject}</p>}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-[#1D293D] font-semibold mb-3 text-lg">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 resize-none ${
                        errors.message
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-[#1D293D]/20 focus:border-[#1D293D] bg-white hover:border-[#1D293D]/40"
                      }`}
                      placeholder="Tell us how we can help you..."
                      disabled={isLoading}
                    />
                    {errors.message && <p className="text-red-600 text-sm mt-2 font-medium">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1D293D] text-white py-5 rounded-xl flex items-center justify-center gap-3 hover:bg-[#2D3B52] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send size={22} className="group-hover:translate-x-1 transition-transform duration-300" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Details Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1D293D] mb-4">Visit Our Luxury Hotel</h2>
            <p className="text-xl text-[#1D293D]/70 max-w-3xl mx-auto">
              Located in the heart of Karachi, PC Hotel offers premium accommodations with easy access to business districts and attractions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1D293D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-[#1D293D]" size={28} />
              </div>
              <h3 className="font-bold text-[#1D293D] text-lg mb-2">Prime Location</h3>
              <p className="text-[#1D293D]/80">Situated on Club Road in the prestigious Karachi area</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1D293D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-[#1D293D]" size={28} />
              </div>
              <h3 className="font-bold text-[#1D293D] text-lg mb-2">Easy Access</h3>
              <p className="text-[#1D293D]/80">20 minutes from Jinnah International Airport</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1D293D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-[#1D293D]" size={28} />
              </div>
              <h3 className="font-bold text-[#1D293D] text-lg mb-2">24/7 Support</h3>
              <p className="text-[#1D293D]/80">Round-the-clock concierge and customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1D293D] mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-[#1D293D]/70 max-w-2xl mx-auto">
              Find quick answers to common questions about our luxury stay experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "What is your cancellation policy?",
                a: "Cancellations made 48 hours before check-in receive a full refund. Cancellations within 48 hours are subject to one night's charge.",
              },
              {
                q: "Do you offer airport transfers?",
                a: "Yes, we offer complimentary airport transfers from Jinnah International Airport for all guests.",
              },
              {
                q: "Are pets allowed?",
                a: "Yes, we welcome pets in our designated pet-friendly rooms. Additional fees may apply.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and digital payment methods.",
              },
              {
                q: "Is early check-in available?",
                a: "Early check-in is subject to availability. Please contact us in advance to arrange.",
              },
              {
                q: "Do you have wheelchair accessible rooms?",
                a: "Yes, we have fully accessible rooms with roll-in showers and wider doorways.",
              },
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-2xl border-2 border-[#1D293D]/10 hover:border-[#1D293D]/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <h3 className="font-bold text-[#1D293D] text-xl mb-4 group-hover:text-[#1D293D] transition-colors">
                  {faq.q}
                </h3>
                <p className="text-[#1D293D]/80 leading-relaxed group-hover:text-[#1D293D]/90">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}