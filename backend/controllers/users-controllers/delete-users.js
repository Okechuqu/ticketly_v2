import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Ticket from "../../models/tickets-model.js";
import User from "../../models/users-model.js";

// @desc Delete users
// @route DELETE /api/users/:id
// @access Admin
export const deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId before querying the database
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: true, message: "Invalid user ID." });
  }

  try {
    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Delete all tickets associated with this user.
    // Since the created_by field stores the user's email, use user.email.
    await Ticket.deleteMany({ created_by: user.email });

    // Delete the user directly
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Server error. Unable to delete user.",
    });
  }
});
