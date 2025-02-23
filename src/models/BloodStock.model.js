const mongoose = require("mongoose");

const BloodStockSchema = new mongoose.Schema({
  bloodType: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  bloodBankCity: { type: String, required: true },
  expirationDate: { type: Date, required: true, validate: {
    validator: function(value) { return value > new Date(); },
    message: "Expiration date must be in the future."
  }},
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true }
}, { timestamps: true });

module.exports = mongoose.model("BloodStock", BloodStockSchema);
