import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  recruiter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const Job = mongoose.model("Job", JobSchema);
export default Job;
