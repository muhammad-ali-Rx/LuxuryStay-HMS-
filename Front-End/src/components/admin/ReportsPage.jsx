import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('dashboard');

  const [dashboardStats, setDashboardStats] = useState({});
  const [revenueReport, setRevenueReport] = useState([]);
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [bookingReport, setBookingReport] = useState([]);
  const [guestReport, setGuestReport] = useState([]);
  const [staffReport, setStaffReport] = useState([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const [
        dashboardRes,
        revenueRes,
        occupancyRes,
        bookingRes,
        guestRes,
        staffRes
      ] = await Promise.all([
        axios.get("http://localhost:3000/reports/dashboard-stats", { 
        }),
        axios.get("http://localhost:3000/reports/revenue/monthly", { 
        }),
        axios.get("http://localhost:3000/reports/occupancy", { 
        }),
        axios.get("http://localhost:3000/reports/bookings/analytics", { 
        }),
        axios.get("http://localhost:3000/reports/guests/analytics", { 
        }),
        axios.get("http://localhost:3000/reports/staff/performance", { 
        }),
      ]);

      setDashboardStats(dashboardRes.data?.data || {});
      setRevenueReport(revenueRes.data?.data || []);
      setOccupancyReport(occupancyRes.data?.data || []);
      setBookingReport(bookingRes.data?.data?.monthlyAnalytics || []);
      setGuestReport(guestRes.data?.data?.topGuests || []);
      setStaffReport(staffRes.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Chart data configurations
  const revenueChartData = {
    labels: revenueReport.map(item => item.period || 'Period'),
    datasets: [
      {
        label: 'Revenue',
        data: revenueReport.map(item => item.revenue || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Average Revenue',
        data: revenueReport.map(item => item.averageRevenue || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const bookingChartData = {
    labels: bookingReport.map(item => `Month ${item._id}`),
    datasets: [
      {
        label: 'Total Bookings',
        data: bookingReport.map(item => item.totalBookings || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Cancelled',
        data: bookingReport.map(item => item.cancelled || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const occupancyChartData = {
    labels: occupancyReport.map(item => item.roomType),
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: occupancyReport.map(item => item.occupancyRate || 0),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
              trend > 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
          <p>{error}</p>
          <button 
            onClick={fetchReports}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Hotel Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive overview of hotel performance and analytics</p>
            </div>
            <div className="flex gap-2 mt-4 lg:mt-0">
              {['dashboard', 'revenue', 'bookings', 'guests', 'staff'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                    activeTab === tab 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 bg-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Dashboard Stats */}
        {(activeTab === 'dashboard' || activeTab === 'revenue') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={dashboardStats.totalRevenue || 0}
              subtitle="All time revenue"
              icon="💰"
              color="green"
              trend={12.5}
            />
            <StatCard
              title="Paid Amount"
              value={dashboardStats.totalPaid || 0}
              subtitle="Received payments"
              icon="💳"
              color="blue"
              trend={8.3}
            />
            <StatCard
              title="Pending Amount"
              value={dashboardStats.pendingRevenue || 0}
              subtitle="Outstanding payments"
              icon="⏳"
              color="yellow"
              trend={-3.2}
            />
            <StatCard
              title="Total Bookings"
              value={dashboardStats.totalBookings || 0}
              subtitle="Confirmed bookings"
              icon="📅"
              color="purple"
              trend={15.7}
            />
          </div>
        )}

        {/* Charts Section */}
        {(activeTab === 'dashboard' || activeTab === 'revenue') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Analytics</h2>
              <div className="h-80">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* Occupancy Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Occupancy by Room Type</h2>
              <div className="h-80">
                <Doughnut 
                  data={occupancyChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                          },
                          usePointStyle: true,
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Booking Analytics */}
        {(activeTab === 'dashboard' || activeTab === 'bookings') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Analytics</h2>
            <div className="h-80">
              <Bar data={bookingChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Occupancy Report */}
        {(activeTab === 'dashboard' || activeTab === 'bookings') && occupancyReport.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-gray-900">Occupancy Report</h2>
              <p className="text-gray-600 text-sm mt-1">Detailed room occupancy and performance metrics</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Nights</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {occupancyReport.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.roomType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.totalBookings}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{Math.round(item.totalNights)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs. {item.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.occupancyRate > 70 ? 'bg-green-100 text-green-800' :
                          item.occupancyRate > 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.occupancyRate?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Guests */}
        {(activeTab === 'dashboard' || activeTab === 'guests') && guestReport.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-gray-900">Top Guests</h2>
              <p className="text-gray-600 text-sm mt-1">Most valuable customers by spending</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Stay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {guestReport.map((guest, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-medium text-sm">
                              {guest.guestName?.split(' ').map(n => n[0]).join('') || 'GU'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{guest.guestName || 'Unknown Guest'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.guestEmail || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {guest.totalBookings} bookings
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs. {guest.totalSpent?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.round(guest.averageStay)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Performance */}
        {(activeTab === 'dashboard' || activeTab === 'staff') && staffReport.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-gray-900">Staff Performance</h2>
              <p className="text-gray-600 text-sm mt-1">Employee metrics and contributions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {staffReport.map((staff, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-medium text-sm">
                              {staff.staffName?.split(' ').map(n => n[0]).join('') || 'ST'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{staff.staffName || 'Unknown Staff'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {staff.staffRole || 'Staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.totalBookings}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs. {staff.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                staff.successRate > 80 ? 'bg-green-500' : 
                                staff.successRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(staff.successRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12">
                            {staff.successRate?.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty States */}
        {occupancyReport.length === 0 && guestReport.length === 0 && staffReport.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">There's no report data to display at the moment.</p>
              <button 
                onClick={fetchReports}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;