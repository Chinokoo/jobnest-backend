import express from "express";
import {
  addSavedJob,
  deleteSavedJob,
  getSavedJobs,
} from "../controllers/savedJobs.controller.js";
import { protectRoute } from "../middleware/auth.js";

const savedJobsRouter = express.Router();

savedJobsRouter.post("/create", protectRoute, addSavedJob);

savedJobsRouter.get("/", protectRoute, getSavedJobs);

savedJobsRouter.delete("/:id", protectRoute, deleteSavedJob);

export default savedJobsRouter;
