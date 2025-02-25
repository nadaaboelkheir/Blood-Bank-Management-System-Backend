const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { generateTokens } = require("../utils/generateToken");
const { sendSuccess } = require("../utils/responseHandler");
const { AppError } = require("../utils/AppError");

const signup = AsyncHandler(async (req, res) => {
  const { nationalID, name, city, email, password } = req.body;
  const existingDonor = await Donor.findOne({ nationalID });
  if (existingDonor) {
    throw new AppError("Email already exists", 400);
  }
  const donor = await Donor.create({ nationalID, name, city, email, password });

  const payload = { id: donor._id, role: "donor" };
  const { accessToken, refreshToken } = generateTokens(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccess(
    res,
    {
      message: "Sign up successful",
      donor: {
        id: donor._id,
        nationalId: donor.nationalID,
        name: donor.name,
        city: donor.city,
        email: donor.email,
      },
      accessToken,
    },
    201
  );
});

const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const donor = await Donor.findOne({ email });
  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  const isMatch = await donor.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = { id: donor._id, role: "donor" };

  const { accessToken, refreshToken } = generateTokens(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccess(res, { message: "Logged in successfully", accessToken });
});

module.exports = { signup, login };
