const mongoose = require("mongoose");

const HospitalRequestSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, required: true },
    hospitalCity: { type: String, required: true },
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    patientStatus: {
      type: String,
      required: true,
      enum: ["Immediate", "Urgent", "Normal"],
    },
    quantity: { type: Number, required: true, min: 1 },
    requestDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Fulfilled", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HospitalRequest", HospitalRequestSchema);
