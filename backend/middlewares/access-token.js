import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/users-model.js";

// Middleware to validate JWT tokens
export const validateToken = asyncHandler(async (req, res, next) => {
  let authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = await User.findById(decoded.userId).select(
        "-password -refreshToken"
      );
      return next();
    } catch (error) {
      console.error("Token verification failed: ", error);
      return res.status(401).json({ error: true, message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ error: true, message: "No token provided" });
  }
});

// Function to generate an access token for a user
export const generateAccessToken = (user) => {
  // Create a JWT with user details and a 7-day expiration
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "14d" }
  );
};

export const generateRefreshToken = (user) => {
  // Create a JWT with user details and a 14-day expiration
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "14d" }
  );
};

// Verify tokens
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return false;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return false;
  }
};
