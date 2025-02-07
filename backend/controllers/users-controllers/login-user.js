import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import User from "../../models/users-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../middlewares/access-token.js";

// @desc Login a user
// @route POST /api/user/login
// @access public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      error: true,
      message: "Please provide email/phone and password",
    });
  }

  try {
    // Static dummy hash for timing attack protection
    const dummyHash = await bcrypt.hash("dummy_password", 10);
    // Fetch user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    }).select("+password");
    // console.log(user);
    if (user && !user.password) {
      console.log("User found without password");
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }

    const isValidPassword = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    // If user does not exist or password is invalid, return error
    if (!user || !isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    // Check email verification status
    if (!user.isVerified) {
      return res.status(403).json({
        error: true,
        message: "Account not verified. Please check your email",
      });
    }

    // Remove sensitive data
    const { password: _, ...safeUser } = user.toObject();

    // Generate token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
    });

    // Successful login response
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error", error);
    res.status(500).json({ error: true, message: "Failed to login user" });
  }
});
