import { Router } from "express";
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket
} from "../controllers/ticketsControllers.js";

const router = Router();

router.get("/", getTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);

export default router;