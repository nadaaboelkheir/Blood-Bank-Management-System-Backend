const express = require("express");
const router = express.Router();
const {
  donateBlood,
  getDonationByDonor,
} = require("../controllers/donation.controller");
const {
  bloodDonationValidator,
} = require("../validations/donation.validations");
const { getDonorByIdValidator } = require("../validations/donor.validations");
const { protectRoute } = require("../middlewares/auth.mw");
router.post("/",  protectRoute(["donor"]),bloodDonationValidator, donateBlood);
router.get(
  "/:donorId",
  protectRoute(["donor"]),
  getDonorByIdValidator,
  getDonationByDonor
);

module.exports = router;
