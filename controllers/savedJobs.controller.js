import SavedJobs from "../models/savedJobs.model.js";

export const addSavedJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user._id;
  try {
    const findSavedJob = await SavedJobs.findOne({
      user_id: userId,
      job_id: jobId,
    });

    if (findSavedJob) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const savedJob = new SavedJobs({ user_id: userId, job_id: jobId });

    await savedJob.save();
    return res
      .status(201)
      .json({ savedJob, message: "Job saved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedJobs = await SavedJobs.find({ user_id: userId })
      .populate("user_id", "name")
      .populate({
        path: "job_id",
        select: "title location description",
        populate: { path: "company_id", select: "name logo_url" },
      });

    return res.status(200).json({ savedJobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteSavedJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const savedJob = await SavedJobs.findOne({
      user_id: userId,
      job_id: id,
    });
    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    await savedJob.deleteOne();
    return res.status(200).json({ message: "Job removed from saved jobs" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
