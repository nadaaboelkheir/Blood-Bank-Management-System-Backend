const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  donationDate: { type: Date, default: Date.now },
  virusTestResult: { type: Boolean, required: true, default: false },
  accepted: { type: Boolean, required: true , default: false },
  rejectionReasons: {
    type: [String],
    required: function() { return !this.accepted; },
    default: [],
    // When donation is not accepted, there must be at least one reason.
    validate: {
      validator: function(arr) {
         if (this.accepted === false) {
             return Array.isArray(arr) && arr.length > 0;
         }
         return true;
      },
      message: 'Rejection reasons must be provided when donation is not accepted.'
    }
  },
  // Fields required only if donation is accepted
  bloodType: {
    type: String,
    required: function() { return this.accepted; },
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },
  bloodBankCity: {
    type: String,
    required: function() { return this.accepted; }
  },
  expirationDate: {
    type: Date,
    required: function() { return this.accepted; },
    validate: {
       validator: function(value) {
         // Ensure expiration date is after donation date.
         if (this.accepted && value) {
             return value > this.donationDate;
         }
         return true;
       },
       message: 'Expiration date must be after the donation date.'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
