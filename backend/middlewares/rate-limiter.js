import rateLimit from "express-rate-limit";

// Create a rate limiter middleware
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({ error: true, message: options.message });
  },
});

// Rate limiting middleware (add to your server setup)
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 9, // Limit each IP to 9 requests per windowMs
  message:
    "Too many accounts created from this IP, please try again after 15 minutes",
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({ error: true, message: options.message });
  },
});
