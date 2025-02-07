import expressAsyncHandler from "express-async-handler";
import Ticket from "../../models/tickets-model.js";

// @desc Update tickets
// @route PUT /api/tickets/:id
// @access Agent only
export const updateTicket = expressAsyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validate ticket status
  if (!["CREATED", "IN_PROGRESS", "REJECTED", "COMPLETED"].includes(status)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid ticket status" });
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: true, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
