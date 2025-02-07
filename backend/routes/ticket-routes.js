import express from "express";
import upload from "../middlewares/multer-config.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { validateToken } from "../middlewares/access-token.js";
import { deleteTicket } from "../controllers/ticket-controllers/delete-tickets.js";
import { createTicket } from "../controllers/ticket-controllers/create-tickets.js";
import { updateTicket } from "../controllers/ticket-controllers/update-tickets.js";
import {
  getTicketById,
  getTickets,
} from "../controllers/ticket-controllers/get-tickets.js";

const router = express.Router();

// Middleware to validate token for all routes
router.use(validateToken);

// Route to get all tickets or create a new ticket
router
  .route("/")
  .get(authorizeRoles("client", "agent", "admin"), getTickets)
  .post(authorizeRoles("client"), upload.single("screenshot"), createTicket);

// Route to get, update or delete a ticket by ID
router
  .route("/:id?")
  .get(authorizeRoles("client", "agent", "admin"), getTicketById)
  .patch(authorizeRoles("agent", "admin"), updateTicket)
  .delete(authorizeRoles("client", "admin"), deleteTicket);

export default router;
