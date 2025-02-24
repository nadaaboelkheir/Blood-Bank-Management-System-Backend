const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { verifyAccessToken } = require("../utils/generateToken");

/**
 * Middleware to protect routes and validate donor access.
 * @param {Array<String>} roles - Allowed roles for the route (e.g., ["donor"])
 * @returns {Function} Express middleware function
 */
exports.protectRoute = (roles = []) =>
  AsyncHandler(async (req, res, next) => {
    // 1. Check for Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // 2. Extract Token
    const token = authHeader.split(" ")[1];

    // 3. Verify Access Token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    // 4. Fetch Donor from Database
    const donor = await Donor.findById(decoded.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // 5. Attach Donor to Request
    req.donor = donor;

    // 6. Validate Role from Token
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions to access this resource",
      });
    }

    // 7. Proceed to Next Middleware
    next();
  });
