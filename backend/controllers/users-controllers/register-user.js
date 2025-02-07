import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";

// import { sendEmail } from "../../middlewares/send-email.js";
import User from "../../models/users-model.js";

// Allowed roles
const ALLOWED_ROLES = ["client", "agent", "admin"];

// Function to extract validation errors from a Mongoose error object
const extractValidationErrors = (error) => {
  return Object.values(error.errors)
    .map((err) => err.message)
    .join(", ");
};

// @desc Register a user
// @route POST /api/user/register
// @access public
export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;

  // Ensure all required fields are present
  if (!first_name || !last_name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please fill in all fields" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  // Password Validation
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: true,
      message:
        "Password must contain 8+ characters with uppercase, lowercase, and numbers",
    });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  }).lean();
  if (existingUser) {
    return res.status(400).json({
      error: true,
      message: `User with this ${
        existingUser.email === email ? "email" : "phone"
      } already exists`,
    });
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification token
    const verificationToken = uuidv4();

    // Create and save new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      display_picture: req.file?.path || null,
      role: ALLOWED_ROLES.includes(role?.toLowerCase())
        ? role.toLowerCase()
        : "client",
      isVerified: true,
      verificationToken,
      verificationExpires: Date.now() + 3600000, // 1 hour
    });

    // Send verification email
    /* try {
      const path = `${process.env.BASE_URL}/verify-email/${verificationToken}`;
      const emailText = `Hello there! Welcome to our website. Your account has been created successfully.
        <br>Click <a href="${path}">here</a> to verify your email. Link expires in 1 hour.`;

      await sendEmail(email, first_name, emailText, verificationToken);
    } catch (error) {
      // Delete the user if verification email failed
      await User.deleteOne({ email: req.body.email });
      console.error(error);
      throw new Error("Aborted verification email", error.message);
    } */

    // Remove sensitive data before sending response
    user.password = undefined;
    user.verificationToken = undefined;

    res.status(201).json({
      success: true,
      message:
        "User created successfully. Please check your email to verify your account.",
      data: user,
    });
  } catch (error) {
    // Handle email sending errors specifically
    if (error.message.includes("ENVELOPE") || error.message.includes("SMTP")) {
      console.log("Email sending failed:", error);

      // Delete the user if verification email failed
      await User.deleteOne({ email: req.body.email });

      return res.status(500).json({
        error: true,
        message: "Failed to send verification email. Please try again.",
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const [[key, value]] = Object.entries(error.keyValue);
      return res.status(409).json({
        error: true,
        message: `${key} '${value}' is already in use`,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: true,
        message: `Validation Failed in Register: ${extractValidationErrors(
          error
        )}`,
      });
    }

    // Log the error and send a server error response
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ error: true, message: "Server Error. Failed to create user" });
  }
});
