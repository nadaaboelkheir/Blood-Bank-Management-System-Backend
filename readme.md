# Blood Donation Management System API

## Description

This project is a backend API for a Blood Donation Management System. It allows donors to register, make blood donations, and hospitals to request blood donations. The API is built using Node.js, Express, and MongoDB with Mongoose ORM.

## Features

- User authentication (signup, login, password hashing) using JWT
- Blood donation management
- Hospital blood requests (processed using a Greedy Algorithm)
- Blood stock tracking
- Secure password handling using bcrypt
- Testing with Jest

## Installation

### Prerequisites

- Node.js installed
- MongoDB instance (local or cloud)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/nadaaboelkheir/Blood-Bank-Management-System-Backend.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=8080
NODE_ENV=development
DB_URL=mongodb://localhost:27017/Blood-Bank-Management-System
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET
JWT_ACCESS_SECRET=JWT_ACCESS_SECRET
GEOAPIFY_API_KEY=67e17d3b8c1140fdaba13c88ebe11dec
EMAIL_USER=nadaaboelkheir1@gmail.com
EMAIL_PASS=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
  
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new donor
- `POST /api/v1/auth/login` - Login and receive a token

### Donation Management

- `POST /api/v1/donation` - Register a blood donation
- `GET /api/v1/donation/donorId` - Get all donations for Donor

### Donor Management

- `GET /api/v1/doner/:id` - Get donor details
- `GET /api/v1/donor/` - Get All donors

### Hospital Requests

- `POST /api/v1/hospital-request/` - Create a hospital request
- `GET /api/v1/hospital-request/process` - process requests
- `GET  /api/v1/hospital-request/:requestId`; get request details
- `GET /api/v1/hospital-request/hospital/:hospitalName` get All Requests By Hospital

## Project Structure

```
src/
│── models/
│   ├── Donor.model.js
│   ├── Donation.model.js
│   ├── HospitalRequest.model.js
│   ├── BloodStock.model.js
│── routes/
│   ├── auth.route.js
│   ├── donation.route.js
│   ├── doner.route.js
│   ├── hospitalRequest.route.js
│── controllers/
│── config/
│── index.js
│── package.json
│── README.md
```

## ERD (Entity-Relationship Diagram)

![ERD](./erd.PNG)

## Postman Collection

[Postman API Documentation](https://documenter.getpostman.com/view/40645831/2sAYdeMBtB)

## Deployment

[Live API Deployment](link_to_deployment)


