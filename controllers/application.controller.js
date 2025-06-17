import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Application from "../models/application.model.js";
import Job from "../models/jobs.model.js";
import stream from "stream";

// create new application
export const createApplication = async (req, res) => {
  const { job_id, skills, experience, Education, name, level } = req.body;
  const resumeFile = req.file;

  // Verify file upload was processed by multer
  if (!resumeFile) {
    return res.status(400).json({
      message: "No resume file uploaded",
      details:
        "Please ensure you're sending the file with field name 'resume' and Content-Type: multipart/form-data",
    });
  }

  try {
    // Validate required fields and file
    if (!job_id || !resumeFile || !skills || !experience || !name || !level) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (experience < 1) {
      return res
        .status(400)
        .json({ message: "Experience should be greater than 0" });
    }

    // Check if job exists
    const job = await Job.findById(job_id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if user is candidate
    if (req.user.role !== "candidate") {
      return res
        .status(401)
        .json({ message: "Unauthorized - Only candidates can apply" });
    }

    // Validate and upload PDF resume
    let resumeUrl;
    try {
      // Validate file type
      if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(resumeFile.mimetype)
      ) {
        return res
          .status(400)
          .json({ message: "Only PDF, DOC, and DOCX files are accepted" });
      }

      // Upload file buffer to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "job_portal_resumes",
            resource_type: "auto",
            allowed_formats: ["pdf", "doc", "docx"],
            max_file_size: 5000000,
            access_mode: "public",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(resumeFile.buffer);
        bufferStream.pipe(uploadStream);
      });

      if (uploadResponse.format !== "pdf") {
        throw new Error("Uploaded file is not a PDF");
      }

      resumeUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("PDF upload error:", uploadError);
      return res.status(400).json({
        message: "Please ensure your resume is valid format under 5MB",
      });
    }

    // Create new application
    const application = new Application({
      job_id,
      candidate_id: req.user._id,
      resume: resumeUrl,
      skills,
      experience,
      Education,
      name,
      level,
      status: "applied",
    });

    await application.save();

    res.status(201).json({
      application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error in create application function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all applications for a job
export const getApplicationsByJobId = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Job ID is required",
      details: "Please provide a valid job ID in the URL path",
    });
  }

  // Validate MongoDB ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid Job ID format",
    });
  }

  try {
    // Check if job exists
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applications = await Application.find({ job_id: id })
      .populate("candidate_id", "name")
      .populate({
        path: "job_id",
        select: "title location",
        populate: { path: "company_id", select: "name" },
      });
    if (!applications) {
      return res.status(404).json({ message: "No applications found" });
    }
    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error in get applications function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get applications by candidate_id
export const getApplicationsByCandidateId = async (req, res) => {
  try {
    const applications = await Application.find({
      candidate_id: req.user._id,
    })
      .populate("job_id", "title")
      .populate({
        path: "job_id",
        select: "title location",
        populate: { path: "company_id", select: "name" },
      });

    if (!applications)
      return res.status(400).json({ message: "No applications found" });

    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error in get applications by candidate function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// update application status
export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      application,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Error in update application status function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
