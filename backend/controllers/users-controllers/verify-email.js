import asyncHandler from "express-async-handler";
import User from "../../models/users-model.js";

// Email Verification Endpoint
// @route GET /api/users/verify-email/:token
// @access public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      error: true,
      message: "No verification token provided",
    });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    return res.status(400).json({
      error: true,
      message: "Invalid or expired verification token",
    });
  }

  if (user.verificationExpires < Date.now()) {
    await User.deleteOne({ _id: user._id });
    return res.status(400).json({
      error: true,
      message:
        "Verification token expired. Please register again to receive a new token.",
    });
  }

  user.isVerified = true;
  user.verificationExpires = undefined;
  user.verificationToken = undefined;

  await user.save();

  // const { password, ...removesPassword } = user.toObject();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: user,
  });
});
