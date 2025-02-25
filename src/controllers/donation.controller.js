const AsyncHandler = require("express-async-handler");
const Donation = require("../models/Donation.model");
const BloodStock = require("../models/BloodStock.model");
const Donor = require("../models/Donor.model");
const { sendEmail } = require("../config/sendMail");
const { sendSuccess } = require("../utils/responseHandler");
const { AppError } = require("../utils/AppError");

const donateBlood = AsyncHandler(async (req, res) => {
  const { donorId, virusTestResult, bloodType, bloodBankCity } = req.body;

  const donor = await Donor.findById(donorId);
  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  const { accepted, rejectionReasons } = await checkDonationEligibility(
    donorId,
    virusTestResult
  );

  if (accepted) {
    validateRequiredBloodDetails(bloodType, bloodBankCity);
  }

  const donation = await createDonationRecord({
    donorId: donor._id,
    virusTestResult,
    accepted,
    rejectionReasons,
    bloodType,
    bloodBankCity,
  });

  if (accepted) {
    await addToBloodInventory({
      donationId: donation._id,
      bloodType,
      bloodBankCity,
      expirationDate: donation.expirationDate,
    });
  } else {
    await notifyDonorOfRejection(donor.email, rejectionReasons);
  }

  return sendSuccess(
    res,
    {
      donation,
      status: accepted
        ? "Donation accepted and added to stock."
        : "Donation rejected.",
    },
    201
  );
});

const checkDonationEligibility = async (donorId, virusTestResult) => {
  const rejectionReasons = [];
  const lastDonation = await getLastSuccessfulDonation(donorId);
  const threeMonthsAgo = calculateThreeMonthsAgoDate();

  if (hasDonatedRecently(lastDonation, threeMonthsAgo)) {
    rejectionReasons.push("Donation within 3 months");
  }

  if (virusTestResult === true) {
    rejectionReasons.push("Virus test positive");
  }

  return {
    accepted: rejectionReasons.length === 0,
    rejectionReasons,
  };
};

const getLastSuccessfulDonation = async (donorId) =>
  await Donation.findOne({ donor: donorId, accepted: true })
    .sort({ donationDate: -1 })
    .exec();

const calculateThreeMonthsAgoDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
};

const hasDonatedRecently = (lastDonation, cutoffDate) =>
  lastDonation && lastDonation.donationDate > cutoffDate;

const validateRequiredBloodDetails = (bloodType, bloodBankCity) => {
  if (!bloodType || !bloodBankCity) {
    throw new AppError(
      "Missing required blood donation details for accepted donation.",
      400
    );
  }
};

const createDonationRecord = async ({
  donorId,
  virusTestResult,
  accepted,
  rejectionReasons,
  bloodType,
  bloodBankCity,
}) => {
  const donationData = {
    donor: donorId,
    virusTestResult,
    accepted,
    rejectionReasons: accepted ? [] : rejectionReasons,
    donationDate: new Date(),
  };

  if (accepted) {
    donationData.bloodType = bloodType;
    donationData.bloodBankCity = bloodBankCity;
    donationData.expirationDate = calculateExpirationDate();
  }

  return await Donation.create(donationData);
};

const calculateExpirationDate = () => {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 42);
  return expiration;
};

const addToBloodInventory = async ({
  donationId,
  bloodType,
  bloodBankCity,
  expirationDate,
}) => {
  await BloodStock.create({
    bloodType,
    bloodBankCity,
    expirationDate,
    donation: donationId,
  });
};

const notifyDonorOfRejection = async (email, rejectionReasons) => {
  await sendEmail(
    email,
    "Blood Donation Rejection",
    `Your donation was rejected due to: ${rejectionReasons.join(", ")}`
  );
};
const getDonationByDonor = AsyncHandler(async (req, res) => {
  const donorId = req.params.donorId;
  const donations = await Donation.find({ donor: donorId });
  if (!donations || donations.length === 0) {
    throw new AppError("Donations not found", 404);
  }
  return sendSuccess(
    res,
    { donations },
    200,
    "Donations retrieved successfully"
  );
});
module.exports = { donateBlood, getDonationByDonor };
