const request = require("supertest");
const express = require("express");
const donorRoutes = require("../routes/doner.route");
const {
  getAllDonors,
  getDonorById,
} = require("../controllers/donor.controller");

jest.mock("../controllers/donor.controller");

const app = express();
app.use(express.json());
app.use("/donors", donorRoutes);

describe("Donor Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /donors - should return a list of donors", async () => {
    getAllDonors.mockImplementation((req, res) => {
      res.status(200).json([{ id: "1", name: "John Doe" }]);
    });

    const res = await request(app).get("/donors");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([{ id: "1", name: "John Doe" }]);
  });

  it("GET /donors/:id - should return donor details for a valid ID", async () => {
    getDonorById.mockImplementation((req, res) => {
      res.status(200).json({ id: req.params.id, name: "John Doe" });
    });

    const res = await request(app).get("/donors/1");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ id: "1", name: "John Doe" });
  });

  it("GET /donors/:id - should return 404 for a non-existent donor", async () => {
    getDonorById.mockImplementation((req, res) => {
      res.status(404).json({ message: "Donor not found" });
    });

    const res = await request(app).get("/donors/999");

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ message: "Donor not found" });
  });
});
