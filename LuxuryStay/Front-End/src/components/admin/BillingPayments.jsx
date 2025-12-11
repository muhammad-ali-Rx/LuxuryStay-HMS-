"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Search,
  Mail,
  Printer,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const BillingPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [sendingInvoice, setSendingInvoice] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalBookings: 0,
  });

  // Function to get token from all possible storage locations
  const getToken = () => {
    const possibleKeys = [
      "token",
      "authToken",
      "adminToken",
      "userToken",
      "luxurystay_token",
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        return token;
      }
    }

    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        return token;
      }
    }

    return null;
  };

  // ✅ FIXED: Enhanced billing data fetch with proper status validation
  const fetchBillingData = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError(
          "Please log in to access billing data. No authentication token found."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:3000/payment/billing-data",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const billingData = response.data.data || [];

        // ✅ Enhanced data mapping with status validation
        const formattedInvoices = billingData.map((invoice) => {
          // ✅ FIX: Ensure payment status and amounts are consistent
          const paymentStatus = mapToFrontendStatus(invoice.paymentStatus);
          const paidAmount = invoice.paid || 0;
          const pendingAmount = invoice.pending || 0;
          const subtotal = invoice.subtotal || 0;

          // ✅ Auto-correct status if amounts don't match status
          let correctedStatus = paymentStatus;
          if (paymentStatus === "paid" && paidAmount < subtotal) {
            correctedStatus = paidAmount > 0 ? "partial" : "pending";
          } else if (paymentStatus === "pending" && paidAmount >= subtotal) {
            correctedStatus = "paid";
          } else if (paymentStatus === "partial" && paidAmount >= subtotal) {
            correctedStatus = "paid";
          }

          return {
            id: invoice.id,
            type: "room_booking",
            guestName: invoice.guestName,
            guestEmail: invoice.guestEmail,
            guestPhone: invoice.guestPhone,
            guestAddress: invoice.guestAddress,
            roomNumber: invoice.roomNumber,
            roomType: invoice.roomType,
            checkIn: invoice.checkIn,
            checkOut: invoice.checkOut,
            nights: invoice.nights,
            roomRate: invoice.roomRate,
            subtotal: subtotal,
            paid: paidAmount,
            pending: pendingAmount,
            paymentStatus: correctedStatus, // ✅ Use corrected status
            invoiceDate: invoice.invoiceDate,
            staff: invoice.staff,
            specialRequests: invoice.specialRequests,
            originalData: invoice,
          };
        });

        setInvoices(formattedInvoices);
        setFilteredInvoices(formattedInvoices);
        calculateStats(formattedInvoices);
        toast.success("✅ Billing data loaded successfully!");
      } else {
        throw new Error(response.data.message);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      setError(error.response?.data?.message || "Failed to load billing data");
      toast.error("❌ Failed to load billing data");
      setLoading(false);
    }
  };

  // ✅ FIXED BACKEND ISSUE: Enhanced payment status update to handle notes array properly
  const updatePaymentStatus = async (invoiceId, newStatus) => {
    try {
      setUpdatingStatus(invoiceId);
      const loadingToast = toast.loading("Updating payment status...");

      const token = getToken();
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error("Please log in to update payment status");
        setUpdatingStatus(null);
        return;
      }

      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) {
        toast.dismiss(loadingToast);
        toast.error("Invoice not found");
        setUpdatingStatus(null);
        return;
      }

      console.log("🔄 Updating payment status:", invoiceId, newStatus);

      // ✅ Calculate amounts based on new status
      let updatedPaid = invoice.paid;
      let updatedPending = invoice.pending;

      if (newStatus === "paid") {
        updatedPaid = invoice.subtotal;
        updatedPending = 0;
      } else if (newStatus === "pending") {
        updatedPaid = 0;
        updatedPending = invoice.subtotal;
      } else if (newStatus === "partial") {
        // Keep current partial amounts, or set to half if both are zero
        if (invoice.paid === 0 && invoice.pending === invoice.subtotal) {
          updatedPaid = Math.floor(invoice.subtotal / 2);
          updatedPending = invoice.subtotal - updatedPaid;
        }
      }

      // ✅ FIX: Create proper notes object to avoid push() error
      const notes = Array.isArray(invoice.originalData?.notes) 
        ? [...invoice.originalData.notes, `Status changed to ${newStatus} via billing system`]
        : [`Status changed to ${newStatus} via billing system`];

      const response = await axios.put(
        `http://localhost:3000/payment/${invoiceId}/payment-status`,
        {
          paymentStatus: mapToBackendStatus(newStatus),
          paidAmount: updatedPaid,
          pendingAmount: updatedPending,
          notes: notes, // ✅ Send as array, not string
          timestamp: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`✅ Payment status updated to ${newStatus}!`);
        await fetchBillingData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("❌ Error updating payment status:", error);
      toast.error(error.response?.data?.message || "Error updating payment status");
      fetchBillingData();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const sendInvoice = async (invoice) => {
    try {
      setSendingInvoice(invoice.id);
      const loadingToast = toast.loading("Sending invoice...");
      
      const token = getToken();
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('Please log in to send invoice');
        setSendingInvoice(null);
        return;
      }

      console.log("📧 Sending invoice to:", invoice.guestEmail);

      const response = await axios.post(
        `http://localhost:3000/payment/${invoice.id}/send-invoice`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`✅ Invoice sent to ${invoice.guestEmail}!`);
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error) {
      console.error("❌ Error sending invoice:", error);
      
      let errorMessage = 'Error sending invoice. ';
      
      if (error.response?.status === 404) {
        errorMessage = 'Invoice not found. Please refresh the page and try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Email might be taking longer to send.';
      } else if (error.message.includes('Email credentials')) {
        errorMessage = 'Email service not configured. Please contact administrator.';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSendingInvoice(null);
    }
  }

  // ✅ FIXED: Map frontend status to backend status
  const mapToBackendStatus = (status) => {
    const statusMap = {
      pending: "pending",
      partial: "partially-paid",
      paid: "paid",
    };
    return statusMap[status] || status;
  };

  // ✅ FIXED: Map backend status to frontend status
  const mapToFrontendStatus = (status) => {
    const statusMap = {
      pending: "pending",
      "partially-paid": "partial",
      paid: "paid",
      failed: "pending",
      refunded: "paid",
    };
    return statusMap[status] || "pending";
  };

  // Calculate statistics
  const calculateStats = (invoices) => {
    const stats = invoices.reduce(
      (acc, invoice) => {
        acc.totalRevenue += invoice.subtotal || 0;
        acc.paidAmount += invoice.paid || 0;
        acc.pendingAmount += invoice.pending || 0;
        acc.totalBookings += 1;
        return acc;
      },
      { totalRevenue: 0, pendingAmount: 0, paidAmount: 0, totalBookings: 0 }
    );

    setStats(stats);
  };

  // Generate PDF (mock function)
  const generatePDF = (invoice) => {
    const pdfContent = `
      LUXURYSTAY INVOICE
      =================
      
      Invoice ID: ${invoice.id}
      Guest: ${invoice.guestName}
      Email: ${invoice.guestEmail}
      Phone: ${invoice.guestPhone}
      
      Room: ${invoice.roomNumber} (${invoice.roomType})
      Check-in: ${invoice.checkIn}
      Check-out: ${invoice.checkOut}
      Nights: ${invoice.nights}
      
      Subtotal: Rs. ${invoice.subtotal.toLocaleString()}
      Paid: Rs. {invoice.paid.toLocaleString()}
      Pending: Rs. {invoice.pending.toLocaleString()}
      
      Payment Status: ${invoice.paymentStatus}
      Invoice Date: ${invoice.invoiceDate}
    `;

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoice.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("✅ PDF generated successfully!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "room_booking":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "restaurant_reservation":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "room_booking":
        return "Room Booking";
      case "restaurant_reservation":
        return "Restaurant";
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.roomNumber?.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.paymentStatus === statusFilter
      );
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  // Download CSV function
  const downloadCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Invoice ID",
      "Type",
      "Guest Name",
      "Guest Email",
      "Guest Phone",
      "Room Number",
      "Room Type",
      "Check-In",
      "Check-Out",
      "Nights",
      "Room Rate",
      "Subtotal",
      "Paid Amount",
      "Pending Amount",
      "Payment Status",
      "Invoice Date",
      "Staff",
    ];

    const csvData = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.type,
      invoice.guestName,
      invoice.guestEmail,
      invoice.guestPhone,
      invoice.roomNumber,
      invoice.roomType,
      invoice.checkIn,
      invoice.checkOut,
      invoice.nights,
      invoice.roomRate,
      invoice.subtotal,
      invoice.paid,
      invoice.pending,
      invoice.paymentStatus,
      invoice.invoiceDate,
      invoice.staff,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luxurystay-billing-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("✅ CSV exported successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37]"></div>
          <p className="text-gray-600 font-medium text-lg">Loading billing data...</p>
        </div>
      </div>
    );
  }

  // Invoice Detail Modal Component
  const InvoiceDetailModal = ({ invoice, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">LUXURYSTAY</h2>
                <p className="text-gray-600 text-lg mt-1">Invoice Details</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Guest Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Bill To:
                </h3>
                <div className="space-y-2">
                  <p className="font-bold text-xl text-gray-900">
                    {invoice.guestName}
                  </p>
                  <p className="text-gray-600">{invoice.guestAddress}</p>
                  <p className="text-gray-600">{invoice.guestPhone}</p>
                  <p className="text-gray-600">{invoice.guestEmail}</p>
                </div>
              </div>
              <div className="space-y-3 text-right">
                <h3 className="font-semibold text-gray-900 text-lg">INVOICE</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Date:{" "}
                    <span className="font-medium">{invoice.invoiceDate}</span>
                  </p>
                  <p className="text-gray-600">
                    Invoice #: <span className="font-medium">{invoice.id}</span>
                  </p>
                  <p className="text-gray-600">
                    Type:{" "}
                    <span className="font-medium">
                      {getTypeText(invoice.type)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0A1F44] to-[#1a365d]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      DESCRIPTION
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                      NIGHTS/DAYS
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider">
                      RATE
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-lg">
                        {invoice.roomNumber} - {invoice.roomType}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {invoice.checkIn} to {invoice.checkOut}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      {invoice.nights}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      Rs. {invoice.roomRate?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-bold text-lg">
                      Rs. {invoice.subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80 bg-gray-50 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-700">
                      Subtotal:
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      Rs. {invoice.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-700">Paid:</span>
                    <span className="font-bold text-green-600 text-lg">
                      Rs. {invoice.paid.toLocaleString()}
                    </span>
                  </div>
                  {invoice.pending > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-200">
                      <span className="font-semibold text-red-600">
                        Pending:
                      </span>
                      <span className="font-bold text-red-600 text-lg">
                        Rs. {invoice.pending.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Staff:</strong>{" "}
                    <span className="font-medium">{invoice.staff}</span>
                  </p>
                  <p className="text-sm text-gray-600 max-w-md">
                    Payment is due within 30 days. Late payments are subject to
                    fees.
                  </p>
                  <p className="text-sm text-gray-600">
                    Contact: info@luxuryStay.com | +92-300-0000000
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    generatePDF(invoice);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    sendInvoice(invoice);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-[#D4AF37] text-[#0A1F44] rounded-xl hover:bg-[#c19b2a] transition-all duration-200 font-medium shadow-sm"
                >
                  <Mail size={18} />
                  Send Invoice
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1F44] to-[#1a365d] text-white py-12 shadow-2xl">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Billing & Payments
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Manage all invoices, track payments, and monitor revenue streams
                in one place
              </p>
            </div>
            <button
              onClick={fetchBillingData}
              className="flex items-center gap-3 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-xl font-semibold hover:bg-[#c19b2a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw size={20} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <AlertCircle
                className="text-yellow-600 mt-1 flex-shrink-0"
                size={24}
              />
              <div className="space-y-2">
                <p className="text-yellow-800 font-semibold text-lg">Notice</p>
                <p className="text-yellow-700">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="container px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Revenue",
              value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
              icon: TrendingUp,
              color: "text-gray-900",
              bgColor: "bg-white",
              iconColor: "text-purple-500",
            },
            {
              label: "Paid Amount",
              value: `Rs. ${stats.paidAmount.toLocaleString()}`,
              icon: CheckCircle,
              color: "text-green-600",
              bgColor: "bg-white",
              iconColor: "text-green-500",
            },
            {
              label: "Pending Amount",
              value: `Rs. ${stats.pendingAmount.toLocaleString()}`,
              icon: Clock,
              color: "text-yellow-600",
              bgColor: "bg-white",
              iconColor: "text-yellow-500",
            },
            {
              label: "Total Bookings",
              value: stats.totalBookings.toString(),
              icon: CreditCard,
              color: "text-blue-600",
              bgColor: "bg-white",
              iconColor: "text-blue-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.iconColor} bg-opacity-10`}
                >
                  <stat.icon className={stat.iconColor} size={28} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by guest name, invoice ID, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 bg-gray-50"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={18}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Download CSV Button */}
            <button
              onClick={downloadCSV}
              className="flex items-center gap-3 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-xl font-semibold hover:bg-[#c19b2a] transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0A1F44] to-[#1a365d]">
                <tr>
                  {[
                    "Type",
                    "Guest",
                    "Dates",
                    "Room Details",
                    "Amount",
                    "Payment Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-2 text-xs font-semibold rounded-full ${getTypeColor(
                          invoice.type
                        )}`}
                      >
                        {getTypeText(invoice.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {invoice.guestName}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {invoice.guestEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {invoice.checkIn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{invoice.checkOut}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-lg">
                          {invoice.roomNumber}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {invoice.roomType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.nights} nights
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900 text-lg">
                          Rs. {invoice.subtotal.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Paid: Rs. {invoice.paid.toLocaleString()}
                        </div>
                        {invoice.pending > 0 && (
                          <div className="text-sm text-red-600 font-medium">
                            Pending: Rs. {invoice.pending.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={invoice.paymentStatus}
                          onChange={(e) =>
                            updatePaymentStatus(invoice.id, e.target.value)
                          }
                          disabled={updatingStatus === invoice.id}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 cursor-pointer ${getStatusColor(
                            invoice.paymentStatus
                          )} ${
                            updatingStatus === invoice.id
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-md"
                          } w-full`}
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                        {updatingStatus === invoice.id && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4AF37]"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => generatePDF(invoice)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                        >
                          <Printer size={16} />
                          PDF
                        </button>
                        <button
                          onClick={() => sendInvoice(invoice)}
                          disabled={sendingInvoice === invoice.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingInvoice === invoice.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                          ) : (
                            <Mail size={16} />
                          )}
                          Email
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-16">
              <FileText size={80} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No invoices found
              </h3>
              <p className="text-gray-500 text-lg">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default BillingPayments;
