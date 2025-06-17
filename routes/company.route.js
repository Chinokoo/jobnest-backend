import express from "express";
import { getAllCompanies, createCompany } from "../controllers/company.controller.js";
import { protectRoute } from "../middleware/auth.js";

const companyRoute = express.Router();

companyRoute.get("/", protectRoute, getAllCompanies);
companyRoute.post("/create", protectRoute, createCompany);

export default companyRoute;
