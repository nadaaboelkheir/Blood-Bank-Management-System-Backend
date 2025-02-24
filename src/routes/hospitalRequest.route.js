const express = require("express");
const router = express.Router();
const { createHospitalRequestBlood ,processHospitalRequests , getRequestStatus,
    getAllRequestsByHospital  } = require("../controllers/hospitalRequest.controller");

router.post("/", createHospitalRequestBlood);
router.get("/process", processHospitalRequests);
router.get("/:requestId", getRequestStatus);
router.get("/hospital/:hospitalId", getAllRequestsByHospital);

module.exports = router;
