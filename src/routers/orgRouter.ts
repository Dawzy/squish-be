import { Router } from "express";
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from "../controllers/orgControllers.js";

import projectsRouter from "./projectsRouter.js";
import teamsRouter from "./teamsRouter.js";

const router = Router();

router.get("/", getOrganizations);
router.get("/:id", getOrganization);
router.post("/", createOrganization);
router.patch("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

router.use("/:id/projects", projectsRouter);
router.use("/:id/teams", teamsRouter);

export default router;