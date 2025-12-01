import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from 'http'; // 👈 NEW: Import createServer
import { Server } from 'socket.io'; // 👈 NEW: Import Socket.IO Server
import connectDB from "./DB/db.mjs"
import User from "./Routers/UserRoute.mjs"
import Register from "./Routers/RegistrationRoute.mjs"
import room from "./Routers/RoomRoute.mjs"
import roomRating from "./Routers/ratingRoutes.mjs"
import restaurants from "./Routers/restaurants.mjs" // Make sure this path is correct
import reservations from "./Routers/reservations.mjs"
import contect from "./Routers/contactRoutes.mjs"
import Booking from "./Routers/bookingRoutes.mjs";
import Task from "./Routers/taskRoutes.mjs";
import payment from './Routers/paymentRoutes.mjs';
import dashboardRoutes from "./Routers/dashboardRoutes.mjs";
import reportRoutes from './Routers/reportRoutes.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Simple CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Increase payload limit
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------------------------------------------------
// 💡 SOCKET.IO SETUP
// -----------------------------------------------------------------
const httpServer = createServer(app); // 👈 Create HTTP server using Express app

export const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173', // Must match your frontend URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Simple test event for client to listen to
    socket.emit('test_connection', { message: 'Successfully connected to server sockets!' });

    socket.on('disconnect', () => {
        console.log(`🚪 User disconnected: ${socket.id}`);
    });
});
// -----------------------------------------------------------------

// Test route
app.get("/api/test-cors", (req, res) => {
  res.json({ message: "CORS is working!", timestamp: new Date().toISOString() });   
});

// Routes
app.use("/users", User)
app.use("/register", Register)
app.use("/room", room)
app.use("/room", roomRating)
app.use("/restaurants", restaurants) // This should point to your fixed routes file
app.use("/reservations", reservations)
app.use("/booking", Booking)
app.use("/task", Task)
app.use("/payment", payment)
app.use('/reports', reportRoutes);
app.use("/dashboard", dashboardRoutes);
app.use('/form', contect)

// Global error handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: "File too large",
            error: "The image file size is too large. Please use smaller images."
        }); 
    }
    
    res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message
    });
});

httpServer.listen(PORT, () => { // 👈 Use httpServer.listen instead of app.listen
    console.log(`🚀 App is running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO running on http://localhost:${PORT}`);
});