import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler.js";
import ticketRoutes from "./routes/ticket-routes.js";
import connectDb from "./config/db-connection.js";
import userRoutes from "./routes/user-routes.js";
import path from "path";
import { fileURLToPath } from "url";

connectDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://ticketly-v2-f.vercel.app",
].filter(Boolean);

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

app.use(compression({ brotli: { quality: 11 }, level: 8, threshold: "1kb" }));

// Express Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));
app.use(cookieParser());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port ${port}`));
