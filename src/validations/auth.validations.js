const { check  } = require("express-validator");
const validatorMiddleware = require("../middlewares/validator.mw");

exports.registerValidator = [
  check("nationalID")
    .exists()
    .withMessage("No nationalID field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("National ID is required")
    .bail()
    .isString()
    .withMessage("National ID must be a string"),

  check("name")
    .exists()
    .withMessage("No name field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be a string"),

  check("city")
    .exists()
    .withMessage("No city field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .bail()
    .isString()
    .withMessage("City must be a string"),

  check("email")
    .exists()
    .withMessage("No email field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  // Validate password
  check("password")
    .exists()
    .withMessage("No password field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long, contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"
    ),

  validatorMiddleware,
];
exports.loginValidator = [
  check("email")
    .exists()
    .withMessage("no email field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .exists()
    .withMessage("no password field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("password required"),
  validatorMiddleware,
];
