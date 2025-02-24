const request = require("supertest");
const express = require("express");

const authRouter = require("../routes/auth.route");

jest.mock("../models/Donor.model", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

const Donor = require("../models/Donor.model");

jest.mock("../utils/generateToken", () => ({
  generateTokens: jest.fn(() => ({
    accessToken: "dummyAccessToken",
    refreshToken: "dummyRefreshToken",
  })),
}));

const app = express();
app.use(express.json());
app.use("/", authRouter);

describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /signup", () => {
    it("should sign up a new donor successfully", async () => {
      const donorData = {
        nationalID: "123456789",
        name: "John Doe",
        city: "Test City",
        email: "john@example.com",
        password: "password123",
      };

      const createdDonor = {
        _id: "donorId123",
        nationalID: donorData.nationalID,
        name: donorData.name,
        city: donorData.city,
        email: donorData.email,
      };

      Donor.create.mockResolvedValue(createdDonor);

      const res = await request(app).post("/signup").send(donorData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("message", "Sign up successful");
      expect(res.body).toHaveProperty("donor");
      expect(res.body.donor).toEqual({
        id: createdDonor._id,
        nationalId: createdDonor.nationalID,
        name: createdDonor.name,
        city: createdDonor.city,
        email: createdDonor.email,
      });
      expect(res.body).toHaveProperty("accessToken", "dummyAccessToken");

      const cookie = res.headers["set-cookie"];
      expect(cookie).toBeDefined();
    });
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };

      const donor = {
        _id: "donorId123",
        email: loginData.email,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Donor.findOne.mockResolvedValue(donor);

      const res = await request(app).post("/login").send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Logged in successfully");
      expect(res.body).toHaveProperty("accessToken", "dummyAccessToken");

      const cookie = res.headers["set-cookie"];
      expect(cookie).toBeDefined();
    });

    it("should fail login when donor is not found", async () => {
      const loginData = {
        email: "notfound@example.com",
        password: "password123",
      };

      Donor.findOne.mockResolvedValue(null);

      const res = await request(app).post("/login").send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should fail login with incorrect password", async () => {
      const loginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const donor = {
        _id: "donorId123",
        email: loginData.email,
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      Donor.findOne.mockResolvedValue(donor);

      const res = await request(app).post("/login").send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});
