import asyncHandler from "express-async-handler";
import Ticket from "../../models/tickets-model.js";

// @desc Get all tickets
// @route GET /api/tickets
// @access Agent/Admin for all tickets, Client for their own
export const getTickets = asyncHandler(async (req, res) => {
  // Destructure query parameters with defaults
  const { page = 1, limit = 5, search = "", status, created_by } = req.query;

  // Convert page and limit to numbers explicitly
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 5;
  const startIndex = (pageNumber - 1) * limitNumber;

  //   Base query base on user role
  const query = {
    summary: { $regex: search, $options: "i" },
    ...(req.user.role === "client" ? { created_by: req.user.email } : {}),
    ...(status && { status }),
    ...(created_by && { created_by }),
  };

  try {
    const totalTickets = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNumber)
      .select(req.user.role === "client" ? "-created_by" : "");

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        totalTickets,
        totalPages: Math.ceil(totalTickets / limitNumber),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
