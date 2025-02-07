import expressAsyncHandler from "express-async-handler";
import Ticket from "../../models/tickets-model.js";

const isValidImage = (value) => {
  if (!value) return false;

  if (typeof value !== "string" || !value) return false;
  // Accept if it starts with a data URL prefix or a valid http/https URL.
  return (
    value.startsWith("data:image/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
};

// @desc Create a ticket
// @route POST /api/tickets
// @access Client only
export const createTicket = expressAsyncHandler(async (req, res) => {
  const { screenshot, summary, status } = req.body;

  if (!screenshot || !summary) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide screenshot and summary" });
  }

  // Ensure only clients can create tickets
  if (!req.user || req.user.role !== "client") {
    return res.status(403).json({
      error: true,
      message: "Only clients are authorized to create tickets.",
    });
  }

  // Validate screenshot URL and base64 image
  if (!isValidImage(screenshot)) {
    return res.status(400).json({
      error: true,
      message: "Invalid image. It must be a valid URL or a valid base64 image.",
    });
  }

  try {
    const existingTicket = await Ticket.findOne({ screenshot });

    if (existingTicket) {
      return res.status(400).json({
        error: true,
        message: "A ticket with the same Image URL already exists",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: true, message: "Server Error" });
  }

  // Validate ticket status
  if (!["CREATED", "IN_PROGRESS", "REJECTED", "COMPLETED"].includes(status)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid ticket status" });
  }

  // Create a new ticket with the provided details and assign the client as the creator
  const ticket = new Ticket({
    screenshot,
    summary,
    status: status || "CREATED",
    created_by: req.user.email,
  });

  try {
    await ticket.save();

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
