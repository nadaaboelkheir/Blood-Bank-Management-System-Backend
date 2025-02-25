const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validator.mw");
exports.getDonorByIdValidator = [
  check("id")
    .exists()
    .withMessage("no id field exists in the request data")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("id required")
    .bail()
    .isMongoId()
    .withMessage("Invalid id"),
  validatorMiddleware,
];
