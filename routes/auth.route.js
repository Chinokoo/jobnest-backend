import express from "express";
import {
  checkAuth,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  updateUser,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.js";

const authRoute = express.Router();

authRoute.post("/signup", register);

authRoute.post("/verify-email", verifyEmail);

authRoute.post("/login", login);

authRoute.post("/forgot-password", forgotPassword);

authRoute.post("/reset-password/:token", resetPassword);

authRoute.get("/check-auth", protectRoute, checkAuth);

authRoute.put("/update-user", protectRoute, updateUser);

authRoute.post("/logout", protectRoute, logout);

export default authRoute;
