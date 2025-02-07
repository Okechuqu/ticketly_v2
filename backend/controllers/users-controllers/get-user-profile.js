import mongoose from "mongoose";
import expressAsyncHandler from "express-async-handler";
import User from "../../models/users-model.js";

// @desc Get User profile
// @route GET /api/user
// @access Private (Client sees self, Admin/Agent sees all or specific user)
export const getUserProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const isSingleUserRequest = Boolean(id); // Determine if the request is for a single user

  // Pagination and filtering parameters
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 20;
  const filterRole = req.query.role;
  const sortBy = req.query.sort || "-createdAt";

  // Field selection configuration for different roles
  const CLIENT_FIELDS = "first_name last_name email phone display_picture";
  const STAFF_FIELDS =
    "first_name last_name email phone display_picture role createdAt";
  const SENSITIVE_FIELDS =
    "-password -refreshToken -verificationToken -resetToken -__v";

  try {
    // Handle client role access
    if (req.user.role === "client") {
      // Clients can only view their own profile
      if (id && id !== req.user._id.toString()) {
        return res.status(403).json({
          error: true,
          message: "Unauthorized to view other user profiles",
        });
      }
      // Fetch the client's own profile
      const user = await User.findById(req.user._id)
        .select(CLIENT_FIELDS)
        .lean();

      // Return the user's profile or a not found error
      return user
        ? res.status(200).json({
            success: true,
            data: user,
          })
        : res.status(404).json({
            error: true,
            message: "User not found",
          });
    }

    // Admin/Agent access with pagination
    if (isSingleUserRequest) {
      // Validate MongoDB ID format for the requested user
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({
          error: true,
          message: "Invalid user ID",
        });
      }

      // Fetch the specific user's profile for admin/agent
      const user = await User.findById(id).select(`${STAFF_FIELDS}`).lean();

      // Return the user's profile or a not found error
      return user
        ? res.status(200).json({
            success: true,
            data: user,
          })
        : res.status(404).json({
            error: true,
            message: "User not found",
          });
    } else {
      const filter = {};
      if (filterRole && ["admin", "agent", "client"].includes(filterRole)) {
        filter.role = filterRole;
      }

      // Validate pagination parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 20;

      // Execute paginated query
      const [users, total] = await Promise.all([
        User.find(filter)
          .select(STAFF_FIELDS)
          .sort(sortBy)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      // Return the list of users and total count
      return res.status(200).json({
        success: true,
        count: users.length,
        total,
        page,
        limit,
        data: users,
      });
    }
  } catch (error) {
    console.error("Profile Error", error);

    // Handle CastError for invalid IDs
    if (error instanceof mongoose.Error.CastError) {
      return res
        .status(404)
        .json({ error: true, message: "Invalid user ID format" });
    }
    // Return a generic error message for other errors
    res
      .status(500)
      .json({ error: true, message: "Failed to get user profile" });
  }
});
