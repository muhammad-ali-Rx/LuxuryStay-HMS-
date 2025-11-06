import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./DB/db.mjs"
import User from "./Routers/UserRoute.mjs"
import Register from "./Routers/RegistrationRoute.mjs"
import room from "./Routers/RoomRoute.mjs"
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(express.json());
app.use(cors());

app.get("/express", (req , res) => {
    res.send("Welcome to the Express App!");
});

app.use("/", User)
app.use("/register", Register)
app.use("/room", room)



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