const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { sendSuccess } = require("../utils/responseHandler");

const getAllDonors = AsyncHandler(async (req, res) => {
  const donors = await Donor.find();
  if (!donors || donors.length === 0) {
    return res.status(404).json({ message: "Donors not found" });
  }

  return sendSuccess(res, { donors }, 200, "Donors retrieved successfully");
});

const getDonorById = AsyncHandler(async (req, res) => {
  const id = req.params.id;
  const donor = await Donor.findById(id);
  if (!donor) {
    return res.status(404).json({ message: "Donor not found" });
  }

  return sendSuccess(res, { donor }, 200, "Donor retrieved successfully");
});

module.exports = {
  getAllDonors,
  getDonorById,
};
