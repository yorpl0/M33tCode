import express from "express";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js"; // Import your problem routes
import { connectDB } from "./lib/db.js"; // Assuming your DB connection is here
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config(); // Load environment variables from .env

const app = express();

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies
app.use(cookieParser()); // To parse cookies
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Use env variable for client URL
    credentials: true, // Allow cookies to be sent
}));

// --- Routes ---
app.use("/api/auth", authRoutes); // Auth routes (login, signup, etc.)
app.use("/api/problems", problemRoutes); // Problem and submission routes

// --- Server Start ---
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// Connect to DB, then start the server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to the database:", err);
        process.exit(1); // Exit if DB connection fails
    });