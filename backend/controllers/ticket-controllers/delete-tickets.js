import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Ticket from "../../models/tickets-model.js";

// @desc Delete tickets
// @route DELETE /api/tickets/:id
// @access Admin for all, Client for their own
export const deleteTicket = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId before querying the database
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: true, message: "Invalid ticket ID." });
  }

  try {
    // Find the ticket
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: true, message: "Ticket not found" });
    }

    // Check if the user has permission to delete the ticket
    if (
      req.user.role === "client" &&
      ticket.created_by.toString() !== req.user.email.toString()
    ) {
      return res.status(403).json({
        error: true,
        message: "Clients can only delete their own tickets.",
      });
    }

    // Delete the ticket directly
    await Ticket.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Server error. Unable to delete ticket.",
    });
  }
});
