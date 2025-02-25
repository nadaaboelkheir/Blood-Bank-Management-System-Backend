const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validator.mw");
exports.hospitalRequestBloodValidator = [
  check("hospitalName")
    .exists()
    .withMessage("No hospitalName field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Hospital name is required")
    .bail()
    .isString()
    .withMessage("Hospital name must be a string"),

  check("hospitalCity")
    .exists()
    .withMessage("No hospitalCity field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Hospital city is required")
    .bail()
    .isString()
    .withMessage("Hospital city must be a string"),

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

  check("quantity")
    .exists()
    .withMessage("No quantity field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  check("patientStatus")
    .exists()
    .withMessage("No patientStatus field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Patient status is required")
    .bail()
    .isIn(["critical", "stable", "urgent"])
    .withMessage("Patient status must be one of: critical, stable, urgent"),

  validatorMiddleware,
];
