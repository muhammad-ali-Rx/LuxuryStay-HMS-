"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Calendar, User, Phone, Mail, CheckCircle, XCircle, Clock, Edit } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    restaurant: "all",
    date: ""
  })
  const [restaurants, setRestaurants] = useState([])
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [updateData, setUpdateData] = useState({
    status: "",
    assignedTable: ""
  })

  const statusOptions = ["all", "pending", "confirmed", "checked-in", "completed", "cancelled", "no_show"]
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    "checked-in": "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-orange-100 text-orange-800"
  }

  useEffect(() => {
    fetchReservations()
    fetchRestaurants()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [searchTerm, filters, reservations])

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get("http://localhost:3000/reservations", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservations(response.data.data || response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      setLoading(false)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get("http://localhost:3000/restaurants")
      setRestaurants(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    }
  }

  const filterReservations = () => {
    let filtered = reservations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.guest?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(reservation => reservation.status === filters.status)
    }

    // Restaurant filter
    if (filters.restaurant !== "all") {
      filtered = filtered.filter(reservation => reservation.restaurant?._id === filters.restaurant)
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter(reservation => 
        new Date(reservation.reservationDate).toDateString() === new Date(filters.date).toDateString()
      )
    }

    setReservations(filtered)
  }

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:3000reservations/${reservationId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchReservations()
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating reservation status")
    }
  }

  const handleCheckIn = async (reservationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:3000/reservations/${reservationId}/checkin`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchReservations()
    } catch (error) {
      console.error("Error during check-in:", error)
      alert("Error during check-in")
    }
  }

  const handleUpdateReservation = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:3000/reservations/${selectedReservation._id}/status`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowUpdateModal(false)
      setSelectedReservation(null)
      setUpdateData({ status: "", assignedTable: "" })
      fetchReservations()
    } catch (error) {
      console.error("Error updating reservation:", error)
      alert("Error updating reservation")
    }
  }

  const openUpdateModal = (reservation) => {
    setSelectedReservation(reservation)
    setUpdateData({
      status: reservation.status,
      assignedTable: reservation.assignedTable || ""
    })
    setShowUpdateModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'cancelled':
      case 'no_show':
        return <XCircle size={16} className="text-red-600" />
      default:
        return <Clock size={16} className="text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
          <p className="text-gray-600 mt-1">Manage all restaurant reservations</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#D4AF37]">{reservations.length}</p>
          <p className="text-sm text-gray-600">Total Reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Checked-in</p>
              <p className="text-xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'checked-in').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by guest or restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statusOptions.filter(s => s !== 'all').map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={filters.restaurant}
            onChange={(e) => setFilters({...filters, restaurant: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map(restaurant => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest & Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Size
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
              {reservations.map((reservation) => (
                <motion.tr
                  key={reservation._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-[#0A1F44]" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.guest?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} />
                          {reservation.guest?.phone || 'No phone'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.restaurant?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(reservation.reservationDate)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {reservation.reservationTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                    </div>
                    {reservation.assignedTable && (
                      <div className="text-sm text-gray-500">
                        Table: {reservation.assignedTable}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reservation.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[reservation.status] || 'bg-gray-100 text-gray-800'}`}>
                        {reservation.status.replace('_', ' ')}
                      </span>
                    </div>
                    {reservation.checkedIn && (
                      <div className="text-xs text-green-600 mt-1">
                        Checked in at {new Date(reservation.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openUpdateModal(reservation)}
                        className="text-[#D4AF37] hover:text-[#c19b2a] transition-colors"
                        title="Edit Reservation"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {reservation.status === 'confirmed' && !reservation.checkedIn && (
                        <button
                          onClick={() => handleCheckIn(reservation._id)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Check-in Guest"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(reservation._id, 'confirmed')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Confirm Reservation"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {!['cancelled', 'completed', 'no_show'].includes(reservation.status) && (
                        <button
                          onClick={() => handleStatusUpdate(reservation._id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Cancel Reservation"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {reservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar size={64} className="mx-auto" />
            </div>
            <p className="text-xl text-gray-600">No reservations found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Update Reservation Modal */}
      {showUpdateModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Reservation</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Reservation Details</h3>
              <p className="text-sm text-gray-600">
                {selectedReservation.guest?.name} - {selectedReservation.restaurant?.name}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedReservation.reservationDate)} at {selectedReservation.reservationTime}
              </p>
              <p className="text-sm text-gray-600">
                Party: {selectedReservation.partySize} people
              </p>
            </div>

            <form onSubmit={handleUpdateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  {statusOptions.filter(s => s !== 'all').map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Table</label>
                <input
                  type="text"
                  value={updateData.assignedTable}
                  onChange={(e) => setUpdateData({...updateData, assignedTable: e.target.value})}
                  placeholder="e.g., Table 12, Booth 5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D4AF37] text-[#0A1F44] py-2 rounded-lg font-semibold hover:bg-[#c19b2a] transition-colors"
                >
                  Update Reservation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedReservation(null)
                    setUpdateData({ status: "", assignedTable: "" })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ReservationsManagement