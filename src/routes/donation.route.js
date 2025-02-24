const express = require("express");
const router = express.Router();
const { donateBlood } = require("../controllers/donation.controller");

router.post("/", donateBlood);

module.exports = router;
