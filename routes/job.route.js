import express from "express";
import {
  createJob,
  deleteJobById,
  getAllJobs,
  getEmployerJobs,
  getJobById,
  getSearchedJobs,
  updateJobStatus,
} from "../controllers/job.controller.js";
import { protectRoute } from "../middleware/auth.js";

const jobRoute = express.Router();

jobRoute.get("/", protectRoute, getAllJobs);

jobRoute.get("/:id", protectRoute, getJobById);

jobRoute.get("/employer/:id", protectRoute, getEmployerJobs);

jobRoute.post("/create", protectRoute, createJob);

jobRoute.post("/search", protectRoute, getSearchedJobs);

jobRoute.put("/:id/status", protectRoute, updateJobStatus);

jobRoute.delete("/:id", protectRoute, deleteJobById);

export default jobRoute;
