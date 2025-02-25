const express = require("express");
const router = express.Router();
const {
  getAllDonors,
  getDonorById,
} = require("../controllers/donor.controller");
const { getDonorByIdValidator } = require("../validations/donor.validations");
const { protectRoute } = require("../middlewares/auth.mw");
router.get("/", getAllDonors);

router.get(
  "/:id",
  protectRoute(["donor"]),
  getDonorByIdValidator,
  getDonorById
);

module.exports = router;
