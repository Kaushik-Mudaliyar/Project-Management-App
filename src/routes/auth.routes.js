import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);

// secured routes
router.post("/logout", verifyJWT, logoutUser);

export default router;
