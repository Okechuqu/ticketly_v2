import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt"; // Import bcrypt to use for comparing tokens
import {
  generateAccessToken,
  verifyRefreshToken,
} from "../../middlewares/access-token.js";
import User from "../../models/users-model.js";

// @desc Refresh access token
// @route POST /api/user/refresh-token
// @access public
export const refreshAccessToken = expressAsyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      error: true,
      message: "Refresh token is missing",
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        error: true,
        message: "Refresh token could not be verified",
      });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const isTokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenMatch) {
      return res.status(403).json({
        error: true,
        message: "Refresh token does not match",
      });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({
      error: true,
      message: "An error occurred while refreshing the token",
    });
  }
});
