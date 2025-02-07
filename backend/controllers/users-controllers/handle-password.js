import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import User from "../../models/users-model.js";
// import { sendEmail } from "../../middlewares/send-email.js";

// Forgot Password Endpoint
// @route POST /api/user/forgot-password
// @access public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({
      error: true,
      message: "Email or Phone Number is required",
    });
  }

  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) {
    return res.status(404).json({
      error: true,
      message: `No account found with that ${email ? "email" : "phone"}`,
    });
  }

  // Generate reset token
  const resetToken = uuidv4();
  user.resetToken = resetToken;
  user.resetExpires = Date.now() + 3600000;
  await user.save();

  /*  try {
    const path = `${process.env.BASE_URL}/reset-password/${resetToken}`;
    const emailText = `Click <a href="${path}">here</a> to reset your password. Link expires in 1 hour.`;

    await sendEmail(user.email, user.first_name, emailText, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    console.error("Password reset email error:", error);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.status(500).json({
      error: true,
      message: "Failed to send password reset email. Please try again",
    });
  } */
});

// Reset Password Endpoint
// @route POST /api/user/reset-password/:token
// @access public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "Invalid or expired reset token",
    });
  }

  // Validate new password
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: true,
      message:
        "Password must contain 8+ characters with uppercase, lowercase, and numbers",
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
