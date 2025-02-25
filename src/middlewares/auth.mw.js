const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { verifyAccessToken } = require("../utils/generateToken");
const { AppError } = require("../utils/AppError");

/**
 * Middleware to protect routes and validate donor access.
 * @param {Array<String>} roles - Allowed roles for the route (e.g., ["donor"])
 * @returns {Function} Express middleware function
 */
const protectRoute = (roles = []) =>
  AsyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new AppError("Unauthorized: Invalid or expired token", 401);
    }

    const donor = await Donor.findById(decoded.id);
    if (!donor) {
      throw new AppError("Unauthorized: Donor not found", 401);
    }

    req.donor = donor;

    if (roles.length > 0 && !roles.includes(decoded.role)) {
      throw new AppError(
        "Unauthorized: Insufficient permissions to access this resource",
        401
      );
    }

    next();
  });

module.exports = {
  protectRoute,
};
