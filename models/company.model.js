import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: String,
    logo_url: String,
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
