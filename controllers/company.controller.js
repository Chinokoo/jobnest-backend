import cloudinary from "../config/cloudinary.js";
import Company from "../models/company.model.js";

// get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ companies });
  } catch (error) {
    console.log("Error in get all companies function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// create a new company
export const createCompany = async (req, res) => {
  const { name, image } = req.body;
  try {
    if (!name || !image) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "job_portal_companies",
    });

    const image_url = uploadResponse.secure_url;

    let company = await Company.findOne({ name });

    if (company) {
      return res.status(400).json({ message: "Company already exists" });
    }

    company = new Company({
      name,
      logo_url: image_url,
    });

    await company.save();
    res.status(201).json({ company, message: "Company created successfully" });
  } catch (error) {
    console.log("Error in create company function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
