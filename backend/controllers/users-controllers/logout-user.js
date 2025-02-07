import asyncHandler from "express-async-handler";
import User from "../../models/users-model.js";

// @desc Logout a User
// @route POST /api/user/logout
// @access Private (Client, Admin, Agent)
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    // 1. Remove refresh token from database
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
      });
    }

    // 2. Clear the refresh token cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Failed to logout user" });
  }
});
