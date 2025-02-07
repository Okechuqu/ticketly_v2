import asyncHandler from "express-async-handler";
import Ticket from "../../models/tickets-model.js";

// @desc Get all tickets
// @route GET /api/tickets
// @access Agent/Admin for all tickets, Client for their own
export const getTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, search = "", status, created_by } = req.query;

  const startIndex = (page - 1) * limit;

  //   Base query base on user role
  const query = {
    summary: { $regex: search, $options: "i" },
    ...(req.user.role === "client" ? { created_by: req.user.email } : {}),
    ...(status && { status }),
    ...(created_by && { created_by }),
  };

  try {
    const totalTickets = await Ticket.countDocuments({ query });
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit))
      .select(req.user.role === "client" ? "-created_by" : "");

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

// @desc Get one ticket
// @route GET /api/tickets/:id
// @access Agent and Admin
export const getTicketById = asyncHandler(async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: true, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
