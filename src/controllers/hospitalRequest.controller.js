const AsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const HospitalRequest = require("../models/HospitalRequest.model");
const BloodStock = require("../models/BloodStock.model");
const geocodeCity = require("../utils/geocode");
const calculateDistance = require("../utils/distance");
const { sendSuccess } = require("../utils/responseHandler");
const { AppError } = require("../utils/AppError");

const createHospitalRequestBlood = AsyncHandler(async (req, res) => {
  const { hospitalName, hospitalCity, bloodType, quantity, patientStatus } =
    req.body;
  if (
    !hospitalName ||
    !hospitalCity ||
    !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(bloodType) ||
    !["Immediate", "Urgent", "Normal"].includes(patientStatus) ||
    quantity <= 0
  ) {
    throw new AppError("Invalid request format.", 400);
  }

  // Create request with default status "Pending"
  const hospitalRequest = await HospitalRequest.create({
    hospitalName,
    hospitalCity,
    bloodType,
    patientStatus,
    quantity,
  });

  return sendSuccess(
    res,
    { hospitalRequest },
    201,
    "Blood request processed successfully."
  );
});

const processHospitalRequests = AsyncHandler(async (req, res, next) => {
  const pendingRequests = await HospitalRequest.find({ status: "Pending" })
    .sort({ createdAt: 1 })
    // .limit(10) // Process exactly 10 requests per batch
    .lean();
  // console.log(pendingRequests);
  if (pendingRequests.length < 10) {
    throw new AppError("Less than 10 pending requests", 400);
  }

  // Process the batch of requests
  const processedRequests = await processBatchRequests(pendingRequests);

  // Send a response with the processed requests
  return sendSuccess(
    res,
    { processedRequests },
    200,
    "Batch processing completed successfully."
  );
});

const processBatchRequests = async (requests) => {
  const statusPriority = { Immediate: 1, Urgent: 2, Normal: 3 };
  const sortedRequests = [...requests].sort((a, b) => {
    // Secondary sort by creation date for same-priority requests
    if (statusPriority[a.patientStatus] === statusPriority[b.patientStatus]) {
      return a.createdAt - b.createdAt;
    }
    return statusPriority[a.patientStatus] - statusPriority[b.patientStatus];
  });
  // return Promise.all(sortedRequests.map(processSingleRequest));
  const results = [];
  for (const request of sortedRequests) {
    results.push(await processSingleRequest(request));
  }
  return results;
};

const processSingleRequest = async (request) => {
  try {
    const hospitalLocation = await geocodeCity(request.hospitalCity);
    const bloodStocks = await BloodStock.find({
      bloodType: request.bloodType,
      expirationDate: { $gt: new Date() },
    }).lean();

    const availableStocks = await processBloodStocks(
      bloodStocks,
      hospitalLocation
    );

    if (availableStocks.length >= request.quantity) {
      await fulfillRequest(request, availableStocks);
      return { ...request, status: "Fulfilled" };
    }

    await rejectRequest(request._id);
    return { ...request, status: "Rejected" };
  } catch (error) {
    await rejectRequest(request._id);
    return { ...request, status: "Rejected" };
  }
};

const processBloodStocks = async (bloodStocks, hospitalLocation) => {
  const geoCache = new Map(); // Simple in-memory cache for demonstration

  const stocksWithDistance = await Promise.all(
    bloodStocks.map(async (stock) => {
      try {
        if (!geoCache.has(stock.bloodBankCity)) {
          geoCache.set(
            stock.bloodBankCity,
            await geocodeCity(stock.bloodBankCity)
          );
        }
        const stockLocation = geoCache.get(stock.bloodBankCity);

        return {
          ...stock,
          distance: calculateDistance(
            hospitalLocation.lat,
            hospitalLocation.lng,
            stockLocation.lat,
            stockLocation.lng
          ),
        };
      } catch (error) {
        if (
          stockLocation.lat === hospitalLocation.lat &&
          stockLocation.lng === hospitalLocation.lng
        ) {
          return { ...stock, distance: 0 };
        }

        console.error(
          `Geocoding failed for ${stock.bloodBankCity}:`,
          error.message
        );
        return null; // Handle failed geocoding explicitly
      }
    })
  );

  return stocksWithDistance
    .filter((stock) => stock !== null)
    .sort((a, b) => a.distance - b.distance);
};

const fulfillRequest = async (request, stocks) => {
  await BloodStock.deleteMany({
    _id: { $in: stocks.slice(0, request.quantity).map((s) => s._id) },
  });

  await HospitalRequest.findByIdAndUpdate(request._id, {
    status: "Fulfilled",
  });
};

const rejectRequest = async (requestId) => {
  await HospitalRequest.findByIdAndUpdate(requestId, {
    status: "Rejected",
  });
  console.log(`Request ${requestId} rejected`);
};
const getRequestStatus = AsyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await HospitalRequest.findById(requestId);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  return sendSuccess(
    res,
    { request },
    200,
    "Request status retrieved successfully"
  );
});

const getAllRequestsByHospital = AsyncHandler(async (req, res) => {
  const { hospitalName } = req.params;
  const requests = await HospitalRequest.find({ hospitalName });
  if (!requests) {
    throw new AppError("Requests not found", 404);
  }
  return sendSuccess(res, { requests }, 200, "Requests retrieved successfully");
});
module.exports = {
  createHospitalRequestBlood,
  processHospitalRequests,
  getRequestStatus,
  getAllRequestsByHospital,
};
