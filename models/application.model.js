import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      enum: ["applied", "shortlisted", "rejected", "accepted"],
      type: String,
      default: "applied",
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    Education: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
