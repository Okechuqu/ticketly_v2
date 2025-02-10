import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import cors from "cors";
// import { errorHandler } from "./middlewares/error-handler.js";
import ticketRoutes from "./routes/ticket-routes.js";
import connectDb from "./config/db-connection.js";
import userRoutes from "./routes/user-routes.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

connectDb();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://ticketly-v2-client.onrender.com",
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

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Serve the static files from the React app build directory
  app.use(express.static(join(__dirname, "dist")));

  // The catch-all handler: for any request that doesn't match an API route, send back index.html
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

// Error handling middleware
// app.use(errorHandler);

export default app;
