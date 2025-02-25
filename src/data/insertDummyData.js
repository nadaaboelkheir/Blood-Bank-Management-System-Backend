const HospitalRequest = require("../models/HospitalRequest.model");
const BloodStock = require("../models/BloodStock.model");
const Donation = require("../models/Donation.model");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { AppError } = require("../utils/AppError");

const dummyHospitalRequests = [
  // Immediate priority - should be processed first
  {
    hospitalName: "Cairo University Hospital",
    hospitalCity: "Cairo",
    bloodType: "A+",
    quantity: 5,
    patientStatus: "Immediate",
    status: "Pending",
  },
  {
    hospitalName: "Alexandria Main Hospital",
    hospitalCity: "Alexandria",
    bloodType: "B-",
    quantity: 3,
    patientStatus: "Immediate",
    status: "Pending",
  },

  // Urgent priority
  {
    hospitalName: "Luxor International Hospital",
    hospitalCity: "Luxor",
    bloodType: "O+",
    quantity: 8,
    patientStatus: "Urgent",
    status: "Pending",
  },
  {
    hospitalName: "Aswan General Hospital",
    hospitalCity: "Aswan",
    bloodType: "AB+",
    quantity: 2,
    patientStatus: "Urgent",
    status: "Pending",
  },

  // Normal priority
  {
    hospitalName: "Sharm El-Sheikh Medical Center",
    hospitalCity: "Sharm El-Sheikh",
    bloodType: "A-",
    quantity: 10,
    patientStatus: "Normal",
    status: "Pending",
  },
  {
    hospitalName: "Hurghada Medical Center",
    hospitalCity: "Hurghada",
    bloodType: "B+",
    quantity: 7,
    patientStatus: "Normal",
    status: "Pending",
  },

  // Edge cases
  {
    hospitalName: "Port Said General Hospital",
    hospitalCity: "Port Said",
    bloodType: "O-",
    quantity: 15, // Will test insufficient stock
    patientStatus: "Immediate",
    status: "Pending",
  },
  {
    hospitalName: "Assiut University Hospital",
    hospitalCity: "Assiut",
    bloodType: "AB-",
    quantity: 1, // Exact match available
    patientStatus: "Urgent",
    status: "Pending",
  },
  {
    hospitalName: "Tanta University Hospital",
    hospitalCity: "Tanta",
    bloodType: "A+",
    quantity: 20, // Enough total but needs distance sorting
    patientStatus: "Normal",
    status: "Pending",
  },
  {
    hospitalName: "Zagazig University Hospital",
    hospitalCity: "Zagazig",
    bloodType: "B-",
    quantity: 5, // Will test expiration date filtering
    patientStatus: "Immediate",
    status: "Pending",
  },
];
const dummyDonations = [
  // Cairo - A+ (5 valid units)
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a1"), // Explicitly define _id
    donor: new ObjectId("67bb5a702f99110a10f9477f"),
    donationDate: new Date("2025-02-01T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a2"), // Explicitly define _id
    donor: new ObjectId("67bb5a702f99110a10f9477f"),
    donationDate: new Date("2025-02-06T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a3"), // Explicitly define _id
    donor: new ObjectId("67bb5a702f99110a10f9477f"),
    donationDate: new Date("2025-02-11T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a4"), // Explicitly define _id
    donor: new ObjectId("67bb5a702f99110a10f9477f"),
    donationDate: new Date("2025-02-16T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-30T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a5"), // Explicitly define _id
    donor: new ObjectId("67bb5a702f99110a10f9477f"),
    donationDate: new Date("2025-02-21T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-04-04T00:00:00.000Z"),
  },

  // Alexandria - B- (3 valid units)
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a6"), // Explicitly define _id
    donor: new ObjectId("67bb923b73e88d23b7d4f004"),
    donationDate: new Date("2025-02-01T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a7"), // Explicitly define _id
    donor: new ObjectId("67bb923b73e88d23b7d4f004"),
    donationDate: new Date("2025-02-06T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a8"), // Explicitly define _id
    donor: new ObjectId("67bb923b73e88d23b7d4f004"),
    donationDate: new Date("2025-02-11T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },

  // Luxor - O+ (4 valid units)
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1a9"), // Explicitly define _id
    donor: new ObjectId("67bb924f73e88d23b7d4f006"),
    donationDate: new Date("2025-02-01T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1aa"), // Explicitly define _id
    donor: new ObjectId("67bb924f73e88d23b7d4f006"),
    donationDate: new Date("2025-02-06T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1ab"), // Explicitly define _id
    donor: new ObjectId("67bb924f73e88d23b7d4f006"),
    donationDate: new Date("2025-02-11T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1ac"), // Explicitly define _id
    donor: new ObjectId("67bb924f73e88d23b7d4f006"),
    donationDate: new Date("2025-02-16T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-30T00:00:00.000Z"),
  },

  // Sharm El-Sheikh - A- (2 valid units)
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1ad"), // Explicitly define _id
    donor: new ObjectId("67bb947af4d8830577d63112"),
    donationDate: new Date("2025-02-01T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A-",
    bloodBankCity: "Sharm El-Sheikh",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    _id: new ObjectId("65f8a7d1d4b8f1a9f7d3e1ae"), // Explicitly define _id
    donor: new ObjectId("67bb947af4d8830577d63112"),
    donationDate: new Date("2025-02-06T00:00:00.000Z"),
    virusTestResult: false,
    accepted: true,
    rejectionReasons: [],
    bloodType: "A-",
    bloodBankCity: "Sharm El-Sheikh",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
];
const dummyBloodStocks = [
  // Cairo - A+ (5 valid units)
  {
    donation: dummyDonations[0]._id, // Links to donation _id
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[1]._id,
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[2]._id,
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[3]._id,
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-03-30T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[4]._id,
    bloodType: "A+",
    bloodBankCity: "Cairo",
    expirationDate: new Date("2025-04-04T00:00:00.000Z"),
  },

  // Alexandria - B- (3 valid units)
  {
    donation: dummyDonations[5]._id,
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[6]._id,
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[7]._id,
    bloodType: "B-",
    bloodBankCity: "Alexandria",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },

  // Luxor - O+ (4 valid units)
  {
    donation: dummyDonations[8]._id,
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[9]._id,
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[10]._id,
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-25T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[11]._id,
    bloodType: "O+",
    bloodBankCity: "Luxor",
    expirationDate: new Date("2025-03-30T00:00:00.000Z"),
  },

  // Sharm El-Sheikh - A- (2 valid units)
  {
    donation: dummyDonations[12]._id,
    bloodType: "A-",
    bloodBankCity: "Sharm El-Sheikh",
    expirationDate: new Date("2025-03-15T00:00:00.000Z"),
  },
  {
    donation: dummyDonations[13]._id,
    bloodType: "A-",
    bloodBankCity: "Sharm El-Sheikh",
    expirationDate: new Date("2025-03-20T00:00:00.000Z"),
  },
];
const insertDummyData = async () => {
  try {
    const hospitalRequests = await HospitalRequest.insertMany(
      dummyHospitalRequests
    );
    if (!hospitalRequests) {
      throw new Error("Failed to insert hospital requests");
    }
    console.log("Dummy hospital requests inserted.");

    const donations = await Donation.insertMany(dummyDonations);
    if (!donations) {
      throw new Error("Failed to insert donations");
    }
    console.log("Dummy donations inserted.");

    const bloodStocks = await BloodStock.insertMany(dummyBloodStocks);
    if (!bloodStocks) {
      throw new Error("Failed to insert blood stocks");
    }
    console.log("Dummy blood stocks inserted.");
  } catch (error) {
    console.error("Error inserting dummy data:", error.message);
  }
};

insertDummyData();
