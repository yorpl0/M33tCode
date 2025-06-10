import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io'; 

import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import postRoutes from "./routes/post.route.js";

const app = express();
const httpServer = createServer(app); // Create an HTTP server from your Express app


const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

// Attach io to the request object so it can be accessed in controllers
// This is one way to pass `io` around. Another is to pass it directly to controller functions.
app.set('io', io);


// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/posts", postRoutes);

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Event listener for a client joining a specific post room
    socket.on('joinPostRoom', (postId) => {
        socket.join(postId); // This puts the socket into a room named after the postId
        console.log(`Socket ${socket.id} joined room ${postId}`);
    });

    // Event listener for a client leaving a specific post room
    socket.on('leavePostRoom', (postId) => {
        socket.leave(postId); // This removes the socket from the room
        console.log(`Socket ${socket.id} left room ${postId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Server Start ---
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

// Connect to DB, then start the HTTP server
connectDB()
    .then(() => {
        httpServer.listen(PORT, () => { // Listen on httpServer, not app
            console.log(`Server listening on port ${PORT}`);
            console.log(`Socket.IO listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    });