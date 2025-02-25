const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { sendSuccess } = require("../utils/responseHandler");
const { AppError } = require("../utils/AppError");

const getAllDonors = AsyncHandler(async (req, res) => {
  const donors = await Donor.find();
  if (!donors || donors.length === 0) {
    throw new AppError("Donors not found", 404);
  }

  return sendSuccess(res, { donors }, 200, "Donors retrieved successfully");
});

const getDonorById = AsyncHandler(async (req, res) => {
  const id = req.params.id;
  const donor = await Donor.findById(id);
  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  return sendSuccess(res, { donor }, 200, "Donor retrieved successfully");
});

module.exports = {
  getAllDonors,
  getDonorById,
};
