const express = require("express");
const router = express.Router();
const {
  createHospitalRequestBlood,
  processHospitalRequests,
  getRequestStatus,
  getAllRequestsByHospital,
} = require("../controllers/hospitalRequest.controller");
const {
  hospitalRequestBloodValidator,
} = require("../validations/hospitalRequests.validations");
router.post("/", hospitalRequestBloodValidator, createHospitalRequestBlood);
router.get("/process", processHospitalRequests);
router.get("/:requestId", getRequestStatus);
router.get("/hospital/:hospitalName", getAllRequestsByHospital);

module.exports = router;
