const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validator.mw");

exports.bloodDonationValidator = [
  check("donorId")
    .exists()
    .withMessage("No donorId field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Donor ID is required")
    .bail()
    .isMongoId()
    .withMessage("Donor ID must be a valid MongoDB ID"),

  check("virusTestResult")
    .exists()
    .withMessage("No virusTestResult field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Virus test result is required")
    .bail()
    .isBoolean()
    .withMessage("Virus test result must be either true or false"),

  check("bloodType")
    .exists()
    .withMessage("No bloodType field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Blood type is required")
    .bail()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood type"),

  check("bloodBankCity")
    .exists()
    .withMessage("No bloodBankCity field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Blood bank city is required")
    .bail()
    .isString()
    .withMessage("Blood bank city must be a string"),

  validatorMiddleware,
];
