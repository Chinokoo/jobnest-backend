import express from "express";
import {
  createApplication,
  getApplicationsByCandidateId,
  getApplicationsByJobId,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { protectRoute } from "../middleware/auth.js";
import multer from "multer";

const upload = multer();
const applicationRoute = express.Router();

applicationRoute.post(
  "/create",
  protectRoute,
  upload.single("resume"),
  createApplication
);

applicationRoute.get("/:id", protectRoute, getApplicationsByJobId);

applicationRoute.get("/", protectRoute, getApplicationsByCandidateId);

applicationRoute.put("/update/:id", protectRoute, updateApplicationStatus);

export default applicationRoute;
