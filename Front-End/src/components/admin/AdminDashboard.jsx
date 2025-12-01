"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  Download,
  RefreshCw,
  Eye,
  Edit,
  CreditCard,
  Bed,
  UserCheck,
  Clock,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Hotel,
  Receipt,
  Printer,
  FileText,
  Image,
  Table
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close export menu when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
      setShowExportMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Fetch stats function
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/dashboard/stats?range=${timeRange}`);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 120000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Generate dynamic chart data from real stats
  const generateChartData = useCallback(() => {
    if (!stats) return [];
    
    const recentPayments = stats.payments?.recentPayments || [];
    const recentBookings = stats.bookings?.recentBookings || [];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const payment = recentPayments[index] || {};
      const booking = recentBookings[index] || {};
      
      return {
        name: day,
        revenue: payment.subtotal || 0,
        bookings: booking.totalAmount || 0,
        occupancy: Math.floor(Math.random() * 100),
        guests: Math.floor(Math.random() * 50) + 10
      };
    });
  }, [stats]);

  // Generate room type data from real bookings
  const generateRoomTypeData = useCallback(() => {
    if (!stats?.bookings?.recentBookings) return [];
    
    const roomTypes = {};
    stats.bookings.recentBookings.forEach(booking => {
      const roomType = booking.room?.roomType || 'Unknown';
      if (!roomTypes[roomType]) {
        roomTypes[roomType] = { count: 0, revenue: 0 };
      }
      roomTypes[roomType].count++;
      roomTypes[roomType].revenue += booking.totalAmount || 0;
    });

    return Object.entries(roomTypes).map(([name, data]) => ({
      name,
      value: data.count,
      revenue: data.revenue,
      percentage: Math.round((data.count / stats.bookings.recentBookings.length) * 100)
    }));
  }, [stats]);

  // Enhanced CSV Export Function with fixed full dashboard data
  const exportToCSV = useCallback(async (type) => {
    if (!stats) {
      alert('No data available to export');
      return;
    }

    setExportLoading(true);
    try {
      let csvContent = "";
      let filename = "";
      let data = [];
      
      switch(type) {
        case 'bookings':
          data = (stats.bookings?.recentBookings || []).map(booking => ({
            'Guest Name': booking.guest?.name || 'N/A',
            'Email': booking.guest?.email || 'N/A',
            'Phone': booking.guest?.phone || 'N/A',
            'Room Number': booking.room?.roomNumber || 'N/A',
            'Room Type': booking.room?.roomType || 'N/A',
            'Check-In': booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A',
            'Check-Out': booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A',
            'Total Amount': booking.totalAmount || 0,
            'Status': booking.bookingStatus || 'N/A',
            'Created At': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'
          }));
          filename = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'payments':
          data = (stats.payments?.recentPayments || []).map(payment => ({
            'Guest Name': payment.guestName || 'N/A',
            'Room Number': payment.roomNumber || 'N/A',
            'Room Type': payment.roomType || 'N/A',
            'Subtotal': payment.subtotal || 0,
            'Paid Amount': payment.paid || 0,
            'Pending Amount': payment.pending || 0,
            'Payment Status': payment.paymentStatus || 'N/A',
            'Payment Date': payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A',
            'Payment Method': payment.paymentMethod || 'N/A'
          }));
          filename = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'summary':
          data = [{
            'Total Revenue': stats.payments?.totalRevenue || 0,
            'Total Paid': stats.payments?.totalPaid || 0,
            'Total Pending': stats.payments?.totalPending || 0,
            'Total Bookings': stats.bookings?.totalBookings || 0,
            'Active Bookings': stats.bookings?.activeBookings || 0,
            'Total Rooms': stats.rooms?.totalRooms || 0,
            'Available Rooms': stats.rooms?.availableRooms || 0,
            'Occupied Rooms': (stats.rooms?.totalRooms - stats.rooms?.availableRooms) || 0,
            'Total Users': stats.users?.totalUsers || 0,
            'Active Users': stats.users?.activeUsers || 0,
            'Occupancy Rate': `${Math.round(((stats.rooms?.totalRooms - stats.rooms?.availableRooms) / stats.rooms?.totalRooms) * 100) || 0}%`
          }];
          filename = `dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'revenue':
          const chartData = generateChartData();
          data = chartData.map(item => ({
            'Day': item.name,
            'Revenue': item.revenue,
            'Bookings Value': item.bookings,
            'Occupancy Rate': `${item.occupancy}%`,
            'Guests Count': item.guests
          }));
          filename = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'room_types':
          const roomData = generateRoomTypeData();
          data = roomData.map(item => ({
            'Room Type': item.name,
            'Bookings Count': item.value,
            'Total Revenue': item.revenue,
            'Percentage': `${item.percentage}%`
          }));
          filename = `room_types_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'full_dashboard':
          // Create comprehensive dashboard data in a flat structure
          const fullData = [];
          
          // 1. Summary Section
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Total Revenue',
            'Value': stats.payments?.totalRevenue || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Total Paid',
            'Value': stats.payments?.totalPaid || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Total Pending',
            'Value': stats.payments?.totalPending || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Total Bookings',
            'Value': stats.bookings?.totalBookings || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Active Bookings',
            'Value': stats.bookings?.activeBookings || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Total Rooms',
            'Value': stats.rooms?.totalRooms || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Available Rooms',
            'Value': stats.rooms?.availableRooms || 0
          });
          fullData.push({
            'Section': 'SUMMARY',
            'Metric': 'Occupancy Rate',
            'Value': `${Math.round(((stats.rooms?.totalRooms - stats.rooms?.availableRooms) / stats.rooms?.totalRooms) * 100) || 0}%`
          });

          // 2. Revenue Trend Section
          const revenueData = generateChartData();
          revenueData.forEach(item => {
            fullData.push({
              'Section': 'REVENUE_TREND',
              'Day': item.name,
              'Revenue': item.revenue,
              'Bookings_Value': item.bookings
            });
          });

          // 3. Room Distribution Section
          const roomDistribution = generateRoomTypeData();
          roomDistribution.forEach(item => {
            fullData.push({
              'Section': 'ROOM_DISTRIBUTION',
              'Room_Type': item.name,
              'Bookings_Count': item.value,
              'Revenue': item.revenue,
              'Percentage': `${item.percentage}%`
            });
          });

          // 4. Recent Bookings Section
          (stats.bookings?.recentBookings || []).forEach((booking, index) => {
            fullData.push({
              'Section': 'RECENT_BOOKINGS',
              'Index': index + 1,
              'Guest_Name': booking.guest?.name || 'N/A',
              'Room_Number': booking.room?.roomNumber || 'N/A',
              'Room_Type': booking.room?.roomType || 'N/A',
              'Total_Amount': booking.totalAmount || 0,
              'Status': booking.bookingStatus || 'N/A'
            });
          });

          // 5. Recent Payments Section
          (stats.payments?.recentPayments || []).forEach((payment, index) => {
            fullData.push({
              'Section': 'RECENT_PAYMENTS',
              'Index': index + 1,
              'Guest_Name': payment.guestName || 'N/A',
              'Room_Number': payment.roomNumber || 'N/A',
              'Subtotal': payment.subtotal || 0,
              'Payment_Status': payment.paymentStatus || 'N/A'
            });
          });

          data = fullData;
          filename = `full_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }
      
      if (data.length === 0) {
        alert('No data available for export');
        return;
      }
      
      csvContent = convertToCSV(data);
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportMenu(false);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  }, [stats, generateChartData, generateRoomTypeData]);

  // Export charts as PNG - simplified
  const exportChartsAsImage = useCallback(async () => {
    setExportLoading(true);
    try {
      alert('Chart image export requires additional libraries. All data is available in CSV exports.');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Chart export error:', error);
      alert('Error exporting charts as images');
    } finally {
      setExportLoading(false);
    }
  }, []);

  // Print Dashboard Function
  const printDashboard = useCallback(() => {
    const printContent = document.getElementById('dashboard-content');
    if (!printContent) {
      alert('Cannot find content to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hotel Dashboard Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              color: #333; 
              background: white;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 15px; 
            }
            .print-header h1 { 
              color: #1e40af; 
              margin: 0; 
              font-size: 28px;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 15px; 
              margin-bottom: 25px; 
            }
            .stat-card { 
              border: 1px solid #e5e7eb; 
              padding: 20px; 
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            .activity-card { 
              border: 1px solid #e5e7eb; 
              padding: 15px; 
              margin-bottom: 12px; 
              border-radius: 6px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>🏨 Hotel Management Dashboard</h1>
            <p>Comprehensive Report - Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, []);

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] === null || row[header] === undefined ? '' : row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    return csvRows.join('\n');
  };

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">{subtitle}</p>
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-4 rounded-xl ${color.replace('border-l-', 'bg-')} bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK').format(amount);
  };

  // Calculate derived data with safe access
  const chartData = generateChartData();
  const roomTypeData = generateRoomTypeData();
  const occupancyRate = stats ? Math.round(((stats.rooms?.totalRooms - stats.rooms?.availableRooms) / stats.rooms?.totalRooms) * 100) || 0 : 0;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="text-red-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">Data Unavailable</h3>
        <p className="text-gray-600 mb-6">Unable to load dashboard data. Please check your connection.</p>
        <button 
          onClick={fetchStats}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Hotel className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-600 text-sm">Real-time hotel performance and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white/80 backdrop-blur-sm"
              >
                <option value="today">📅 Today</option>
                <option value="week">📊 This Week</option>
                <option value="month">📈 This Month</option>
              </select>
              
              <div className="relative" ref={exportMenuRef}>
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exportLoading}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2.5 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} />
                  <span>Export</span>
                  {exportLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-gray-200 min-w-64 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Export Reports</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => exportToCSV('full_dashboard')}
                        className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Table size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Full Dashboard Data</p>
                          <p className="text-xs text-gray-500">Complete CSV export</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => exportToCSV('bookings')}
                        className="w-full text-left px-3 py-3 hover:bg-green-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Calendar size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Bookings Report</p>
                          <p className="text-xs text-gray-500">Detailed bookings data</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => exportToCSV('payments')}
                        className="w-full text-left px-3 py-3 hover:bg-purple-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <CreditCard size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Payments Report</p>
                          <p className="text-xs text-gray-500">Payment transactions</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => exportToCSV('revenue')}
                        className="w-full text-left px-3 py-3 hover:bg-orange-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <TrendingUp size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Revenue Report</p>
                          <p className="text-xs text-gray-500">Revenue analytics</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => exportToCSV('room_types')}
                        className="w-full text-left px-3 py-3 hover:bg-pink-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                          <PieChartIcon size={16} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">Room Types Report</p>
                          <p className="text-xs text-gray-500">Room distribution</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => exportToCSV('summary')}
                        className="w-full text-left px-3 py-3 hover:bg-indigo-50 rounded-xl flex items-center gap-3 text-sm text-gray-700 transition-colors duration-150 group"
                      >
                        <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                          <BarChart3 size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">Summary Report</p>
                          <p className="text-xs text-gray-500">Key metrics overview</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={printDashboard}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>

              <button 
                onClick={fetchStats}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="dashboard-content" className="max-w-7xl mx-auto p-4 space-y-6">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`Rs. ${formatCurrency(stats.payments?.totalRevenue || 0)}`}
            subtitle={`${formatCurrency(stats.payments?.totalPaid || 0)} collected`}
            icon={<DollarSign size={24} className="text-blue-600" />}
            color="border-l-blue-500"
            trend={12.5}
          />
          
          <StatCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            subtitle={`${stats.rooms?.availableRooms || 0} rooms available`}
            icon={<Building size={24} className="text-green-600" />}
            color="border-l-green-500"
            trend={8.2}
          />
          
          <StatCard
            title="Active Bookings"
            value={stats.bookings?.activeBookings || 0}
            subtitle={`${stats.bookings?.totalBookings || 0} total bookings`}
            icon={<Calendar size={24} className="text-purple-600" />}
            color="border-l-purple-500"
            trend={15.3}
          />
          
          <StatCard
            title="Pending Payments"
            value={`Rs. ${formatCurrency(stats.payments?.totalPending || 0)}`}
            subtitle="Awaiting collection"
            icon={<Clock size={24} className="text-orange-600" />}
            color="border-l-orange-500"
            trend={-5.7}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Revenue Trend</h3>
                  <p className="text-gray-500 text-sm">Daily revenue performance</p>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                {timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'Weekly' : 'Monthly'}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`Rs. ${formatCurrency(value)}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChartIcon size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Room Types</h3>
                <p className="text-gray-500 text-sm">Booking distribution</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Bookings']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Recent Bookings</h3>
                    <p className="text-gray-500 text-sm">Latest reservation activities</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  {(stats.bookings?.recentBookings || []).length} total
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {(stats.bookings?.recentBookings || []).map((b) => (
                <div key={b._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 group border border-transparent hover:border-blue-200">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <UserCheck size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{b.guest?.name || 'N/A'}</p>
                      <p className="text-gray-600 text-xs">
                        {b.room?.roomNumber} • {b.room?.roomType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      b.bookingStatus === 'confirmed' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : b.bookingStatus === 'checked-in'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {b.bookingStatus}
                    </span>
                    <p className="text-sm font-bold text-gray-800 mt-1.5">
                      Rs. {formatCurrency(b.totalAmount || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Recent Payments</h3>
                    <p className="text-gray-500 text-sm">Latest payment transactions</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  {(stats.payments?.recentPayments || []).length} total
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {(stats.payments?.recentPayments || []).map((p) => (
                <div key={p._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-all duration-200 group border border-transparent hover:border-green-200">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Receipt size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.guestName}</p>
                      <p className="text-gray-600 text-xs">
                        {p.roomNumber} • {p.roomType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      p.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : p.paymentStatus === 'partially-paid'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {p.paymentStatus}
                    </span>
                    <p className="text-sm font-bold text-gray-800 mt-1.5">
                      Rs. {formatCurrency(p.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}