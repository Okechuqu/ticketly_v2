import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler.js";
import ticketRoutes from "./routes/ticket-routes.js";
import connectDb from "./config/db-connection.js";
import userRoutes from "./routes/user-routes.js";

connectDb();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://ticketly-v2-api.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// Cors
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(compression({ brotli: { quality: 11 }, level: 8, threshold: "1kb" }));

// Express Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));
app.use(cookieParser());

// Routes
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Ticketly API server.");
});

// Error handling middleware
// app.use(errorHandler);

export default app;
