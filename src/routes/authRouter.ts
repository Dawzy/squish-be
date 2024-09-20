import { Router } from "express";
import authenticate from "../middleware/auth.js";
import {
  register,
  login,
  updateUser,
  deleteUser
} from "../controllers/authController.js";

const router = Router();

router.get("/", login);
router.post("/", register);
router.patch("/", authenticate, updateUser);
router.delete("/", authenticate, deleteUser);

export default router;