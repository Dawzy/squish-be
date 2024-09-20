import { Router } from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectsControllers.js";

import ticketsRouter from "./ticketsRouter.js";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

router.use("/:id/tickets", ticketsRouter);

export default router;