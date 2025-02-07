import express from "express";
import upload from "../middlewares/multer-config.js";
import { loginRateLimiter } from "../middlewares/rate-limiter.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { validateToken } from "../middlewares/access-token.js";
import { refreshAccessToken } from "../controllers/users-controllers/refresh-access-token.js";
import { updateUserProfile } from "../controllers/users-controllers/update-profile.js";
import { getUserProfile } from "../controllers/users-controllers/get-user-profile.js";
import { updateTicket } from "../controllers/ticket-controllers/update-tickets.js";
import { registerUser } from "../controllers/users-controllers/register-user.js";
import { verifyEmail } from "../controllers/users-controllers/verify-email.js";
import { logoutUser } from "../controllers/users-controllers/logout-user.js";
import { loginUser } from "../controllers/users-controllers/login-user.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/users-controllers/handle-password.js";

const router = express.Router();

router
  .post("/register", registerUser)
  .post("/login", loginRateLimiter, loginUser)
  .post("/logout", validateToken, logoutUser)
  .post("/forgot-password", forgotPassword)
  .post("/reset-password/:token", resetPassword);

// Protected routes for authenticated users
router
  .get(
    "/profile/:id?",
    validateToken,
    authorizeRoles("admin", "agent", "client"),
    getUserProfile,
    upload.single("display_picture"),
    updateTicket
  )
  .put(
    "/profile/:id?",
    validateToken,
    authorizeRoles("admin", "agent", "client"),
    upload.single("display_picture"),
    updateUserProfile
  )
  .get("/verify-email/:token", verifyEmail)
  .get("/refresh-token", refreshAccessToken);

export default router;
