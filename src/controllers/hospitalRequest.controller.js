const AsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const HospitalRequest = require("../models/HospitalRequest.model");
const BloodStock = require("../models/BloodStock.model");
const geocodeCity = require("../utils/geocode");
const calculateDistance = require("../utils/distance");

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
    return res.status(400).json({ error: "Invalid request format." });
  }

  // Create request with default status "Pending"
  const hospitalRequest = await HospitalRequest.create({
    hospitalName,
    hospitalCity,
    bloodType,
    patientStatus,
    quantity,
  });

  res.status(201).json({
    message: "Blood request processed successfully.",
    hospitalRequest,
  });
});

const processHospitalRequests = AsyncHandler(async (req, res, next) => {
  try {
    const pendingRequests = await HospitalRequest.find({ status: "Pending" })
      .sort({ createdAt: 1 })
      // .limit(10) // Process exactly 10 requests per batch
      .lean();
    // console.log(pendingRequests);
    if (pendingRequests.length < 10) {
      return res
        .status(400)
        .json({ message: " Less than 10 pending requests" });
    }

    // Process the batch of requests
    const processedRequests = await processBatchRequests(pendingRequests);

    // Send a response with the processed requests
    res.status(200).json({
      message: "Batch processing completed",
      processedRequests: processedRequests,
    });
  } catch (error) {
    console.error("Batch processing error:", error.message);
    res.status(500).json({ error: "Batch processing error" });
  }
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
        if (stockLocation.lat === hospitalLocation.lat && stockLocation.lng === hospitalLocation.lng) {
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
    return res.status(404).json({ error: "Request not found" });
  }

  res.status(200).json(request);
});

const getAllRequestsByHospital = AsyncHandler(async (req, res) => {
  const { hospitalName } = req.params;
  const requests = await HospitalRequest.find({ hospitalName });
  return res.status(200).json(requests);
});
module.exports = {
  createHospitalRequestBlood,
  processHospitalRequests,
  getRequestStatus,
  getAllRequestsByHospital,
};
