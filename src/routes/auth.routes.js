import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);

export default router;
