import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./DB/db.mjs"
dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(express.json());
app.use(cors());



app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message || "Unknown error",
    });
  });


  app.get("/", (req, res) => {
    res.send("Welcome to the Express App!");
  });

app.listen(PORT, () => {
    console.log(`🚀 App is running on http://localhost:${PORT}`);
});