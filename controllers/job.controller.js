import Company from "../models/company.model.js";
import Job from "../models/jobs.model.js";
import mongoose from "mongoose";

// get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .sort("createdAt 1")
      .skip(skip)
      .limit(limit)
      .populate("recruiter_id", "name")
      .populate("company_id", "name logo_url");

    const totalJobs = await Job.countDocuments();

    res.status(200).json({
      jobs,
      page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  } catch (error) {
    console.error("Error in get all jobs function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get single job
export const getJobById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }
  try {
    const job = await Job.findById(id)
      .populate("recruiter_id", "name")
      .populate("company_id", "name logo_url");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ job });
  } catch (error) {
    console.error("Error in get job by id function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get employer jobs
export const getEmployerJobs = async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await Job.find({ recruiter_id: id })
      .sort("createdAt 1")
      .populate("company_id", "name logo_url");

    if (!jobs) return res.status(400).json({ message: "No jobs found" });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("error in get employer jobs function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// create a new job
export const createJob = async (req, res) => {
  const { title, company, description, location, requirements } = req.body;
  try {
    const findCompany = await Company.findById(company);
    if (!findCompany) {
      return res.status(400).json({ message: "Company not found" });
    }

    const recruiter = req.user;

    if (recruiter.role !== "employer") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const company_id = findCompany._id;

    const job = new Job({
      recruiter_id: recruiter._id,
      company_id,
      title,
      description,
      location,
      requirements,
      isOpen: true,
    });

    await job.save();

    res.status(201).json({ job, message: "Job created successfully" });
  } catch (error) {
    console.error("Error in create job function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// search jobs
export const getSearchedJobs = async (req, res) => {
  const { search } = req.query;
  try {
    const jobs = await Job.find({
      $or: [
        { title: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ],
    })
      .populate("recruiter_id", "name")
      .populate("company_id", "name logo_url");

    if (jobs.length === 0)
      return res.status(404).json({ message: "No jobs found" });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error in get searched jobs function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// update job status
export const updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { isOpen } = req.body;

  try {
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (
      job._id.toString() !== req.user._id.toString() &&
      req.user.role !== "employer"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    job.isOpen = isOpen;
    await job.save();

    res.status(200).json({ job, message: "Job status updated successfully" });
  } catch (error) {
    console.error("Error in update job status function", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// delete job by ID
export const deleteJobById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Verify requester is the job owner
    if (job.recruiter_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden - You can only delete your own jobs",
      });
    }

    await Job.findByIdAndDelete(id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error in delete job function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
