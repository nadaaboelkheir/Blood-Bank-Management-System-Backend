const donorService = require("../services/donor.service");
const AsyncHandler = require("express-async-handler");
const Donor = require("../models/Donor.model");
const { generateTokens } = require("../utils/generateToken");


exports.signup = AsyncHandler(async (req, res) => {
 
    const { nationalID, name, city, email, password } = req.body;
    const donor = await Donor.create({ nationalID, name, city, email, password });
    
    // Prepare payload for token generation
    const payload = { id: donor._id, role: "donor" };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      message: "Sign up successful",
      donor: {
        id: donor._id,
        nationalId: donor.nationalID,
        name: donor.name,
        city: donor.city,
        email: donor.email
      },
      accessToken
    });
 
})

exports.login = AsyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const donor = await Donor.findOne({ email });
      if (!donor) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const isMatch = await donor.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Create payload with donor's id and role
      const payload = { id: donor._id, role: "donor" };
  
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(payload);
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
    res.status(200).send({ message: "Logged in successfully",accessToken });
    
  })
  