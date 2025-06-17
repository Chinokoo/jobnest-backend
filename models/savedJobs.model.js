import mongoose from "mongoose";

const savedJobsSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const SavedJobs = mongoose.model("SavedJobs", savedJobsSchema);

export default SavedJobs;
