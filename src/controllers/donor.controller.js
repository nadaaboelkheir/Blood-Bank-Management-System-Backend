const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");

const getAllDonors = AsyncHandler(async (req, res) => {
  const donors = await Donor.find();
  if (!donors) return res.status(404).json({ message: "Donors not found" });
  res.json(donors);
});

const getDonorById = AsyncHandler(async (req, res) => {
  const id = req.params.id;
  const donor = await Donor.findById(id);
  if (!donor) return res.status(404).json({ message: "Donor not found" });
  res.json(donor);
});

module.exports = {
  getAllDonors,
  getDonorById,
};
