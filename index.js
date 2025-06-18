import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import jobRoute from "./routes/job.route.js";
import companyRoute from "./routes/company.route.js";
import savedJobsRouter from "./routes/savedJobs.route.js";
import applicationRoute from "./routes/application.route.js";

const app = express();

dotenv.config();

const port = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({ origin: "https://job-nest-gamma.vercel.app/", credentials: true })
);

app.use("/api/auth", authRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/company", companyRoute);
app.use("/api/saved-jobs", savedJobsRouter);
app.use("/api/application", applicationRoute);

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
