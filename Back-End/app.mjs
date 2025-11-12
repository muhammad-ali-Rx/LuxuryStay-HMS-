import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./DB/db.mjs"
import User from "./Routers/UserRoute.mjs"
import Register from "./Routers/RegistrationRoute.mjs"
import room from "./Routers/RoomRoute.mjs"
import roomRating from "./Routers/ratingRoutes.mjs"
import restaurants from "./Routers/restaurants.mjs"
import reservations from "./Routers/reservations.mjs"
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/express", (req , res) => {
    res.send("Welcome to the Express App!");
});

app.use("/users", User)
app.use("/register", Register)
app.use("/room", room)
app.use("/room", roomRating)
app.use("/restaurants", restaurants)
app.use("/reservations", reservations)

// Global error handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message || "Unknown error",
    });
});

app.listen(PORT, () => {
    console.log(`🚀 App is running on http://localhost:${PORT}`);
});