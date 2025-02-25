const request = require("supertest");
const express = require("express");

const donationRouter = require("../routes/donation.route");

// Mock the helper functions used in the controller
jest.mock("../controllers/donation.controller", () => ({
  donateBlood: jest.fn(),
}));

const { donateBlood } = require("../controllers/donation.controller");

const app = express();
app.use(express.json());
app.use("/donations", donationRouter);

describe("Donation Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /donations", () => {
    it("should accept donation and add to blood stock when eligible", async () => {
      const donationData = {
        donorId: "donor123",
        virusTestResult: false,
        bloodType: "A+",
        bloodBankCity: "City",
      };

      const mockResponse = {
        message: "Donation accepted and added to stock.",
        donation: {
          _id: "donation123",
          donor: "donor123",
          virusTestResult: false,
          accepted: true,
          bloodType: "A+",
          bloodBankCity: "City",
          donationDate: new Date(),
          expirationDate: new Date(new Date().setDate(new Date().getDate() + 42)),
          rejectionReasons: [],
        },
      };

      // Mock the controller function
      donateBlood.mockImplementation(async (req, res) => {
        res.status(201).json(mockResponse);
      });

      const res = await request(app)
        .post("/donations")
        .send(donationData);

      // console.log(res.body); // Debugging: Log the response body

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockResponse);
    });

    it("should reject donation due to recent donation within 3 months", async () => {
      const donationData = {
        donorId: "donor123",
        virusTestResult: false,
        bloodType: "A+",
        bloodBankCity: "City",
      };

      const mockResponse = {
        message: "Donation rejected.",
        donation: {
          _id: "donation123",
          donor: "donor123",
          virusTestResult: false,
          accepted: false,
          rejectionReasons: ["Donation within 3 months"],
          donationDate: new Date(),
        },
      };

      // Mock the controller function
      donateBlood.mockImplementation(async (req, res) => {
        res.status(201).json(mockResponse);
      });

      const res = await request(app)
        .post("/donations")
        .send(donationData);

      // console.log(res.body); // Debugging: Log the response body

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockResponse);
    });

    it("should reject donation due to positive virus test", async () => {
      const donationData = {
        donorId: "donor123",
        virusTestResult: true,
        bloodType: "A+",
        bloodBankCity: "City",
      };

      const mockResponse = {
        message: "Donation rejected.",
        donation: {
          _id: "donation123",
          donor: "donor123",
          virusTestResult: true,
          accepted: false,
          rejectionReasons: ["Virus test positive"],
          donationDate: new Date(),
        },
      };

      // Mock the controller function
      donateBlood.mockImplementation(async (req, res) => {
        res.status(201).json(mockResponse);
      });

      const res = await request(app)
        .post("/donations")
        .send(donationData);

      // console.log(res.body); // Debugging: Log the response body

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockResponse);
    });

    it("should return 400 if accepted but missing blood details", async () => {
      const donationData = {
        donorId: "donor123",
        virusTestResult: false,
      };

      const mockResponse = {
        error: "Missing required blood donation details for accepted donation.",
      };

      // Mock the controller function
      donateBlood.mockImplementation(async (req, res) => {
        res.status(400).json(mockResponse);
      });

      const res = await request(app)
        .post("/donations")
        .send(donationData);

      // console.log(res.body); // Debugging: Log the response body

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(mockResponse);
    });

    it("should return 404 if donor not found", async () => {
      const donationData = {
        donorId: "invalidDonor",
        virusTestResult: false,
        bloodType: "A+",
        bloodBankCity: "City",
      };

      const mockResponse = {
        error: "Donor not found",
      };

      // Mock the controller function
      donateBlood.mockImplementation(async (req, res) => {
        res.status(404).json(mockResponse);
      });

      const res = await request(app)
        .post("/donations")
        .send(donationData);

      // console.log(res.body); // Debugging: Log the response body

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual(mockResponse);
    });
  });
});