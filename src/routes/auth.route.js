const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
} = require("../validations/auth.validations");

router.post("/signup", registerValidator,signup);
router.post("/login", loginValidator,login);

module.exports = router;
