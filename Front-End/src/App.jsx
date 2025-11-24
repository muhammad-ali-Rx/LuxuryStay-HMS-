"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Splash Screen
import SplashScreen from "./pages/SplashScreen";

// User Pages
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Dining from "./pages/Dining";
import Facilities from "./pages/Facilities";
import Gallery from "./pages/Gallery";
import ConfirmationPage from "./pages/BookingConfirmation";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import Reservations from "./pages/Reservations";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import BookingDetails from "./pages/BookingDetails";
// Admin Pages
import AdminPanel from "./pages/admin/AdminPanel";

import socket from "./utils/socket.mjs"; // 👈 NEW: Import the socket instance
import { Toaster } from "react-hot-toast";

// Protected Route Component for User Booking
function ProtectedBookingRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "booking" }} replace />;
  }

  return <Booking />;
}

function ProtectedReservationsRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "reservations" }} replace />;
  }

  return <Reservations />;
}

function ProtectedAdminRoute() {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  console.log(adminUser);

  const adminRoles = ["admin", "manager", "receptionist", "housekeeping"];
  if (!adminUser || !adminRoles.includes(adminUser.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminPanel />;
}

function AppRoutes() {
  const [splashShown, setSplashShown] = useState(() => {
    return localStorage.getItem("splashShown") === "true";
  });

  // 💡 SOCKET.IO CONNECTION LOGIC
  useEffect(() => {
    // 1. Connect the socket
    socket.connect();
    console.log("Attempting to connect to socket server...");

    // 2. Listen for the simple test event from the server
    socket.on("test_connection", (data) => {
      console.log("Socket Connection Success:", data.message);
    });

    // 3. Optional: Log connection status changes
    socket.on("connect", () => {
      console.log(`Socket connected: ${socket.id}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected. Reason: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // 4. Cleanup function: Disconnect the socket when the component unmounts
    return () => {
      socket.off("test_connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      console.log("Socket disconnected.");
    };
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (splashShown) {
      localStorage.setItem("splashShown", "true");
    }
  }, [splashShown]);

  return (
    <AnimatePresence mode="wait">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              border: '1px solid #10b981',
              background: '#f0fdf4',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              background: '#fef2f2',
            },
          },
          loading: {
            style: {
              border: '1px solid #f59e0b',
              background: '#fffbeb',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />

        {/* Splash Screen - only shown once */}
        <Route
          path="/splash"
          element={
            <SplashScreen
              onSplashComplete={() => {
                setSplashShown(true);
                localStorage.setItem("splashShown", "true");
              }}
            />
          }
        />

        {/* User Frontend Routes - Public */}
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />

        {/* User Auth Routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* Protected Booking Routes - Requires Authentication */}
        <Route path="/booking" element={<ProtectedBookingRoute />} />
        <Route path="/BookingConfirmation" element={<ConfirmationPage />} />
        <Route path="/booking-details/:id" element={<BookingDetails />} />

        <Route path="/reservations" element={<ProtectedReservationsRoute />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
