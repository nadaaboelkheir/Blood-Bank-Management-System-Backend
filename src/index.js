const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const sanitizer = require("perfect-express-sanitizer");
const cookieParser = require("cookie-parser");
const { PORT, NODE_ENV } = require("./config/env");
const dbConnect = require("./config/db");
const routes = require("./routes/index");
const app = express();
app.use(express.json());
app.use(cookieParser());

// Logging incoming requests
app.use(morgan("dev"));

// Security: Helmet to set various HTTP headers for security
app.use(helmet());
// Input sanitization to prevent XSS and SQL Injection attacks
app.use(
  sanitizer.clean({
    xss: true,
    sql: true,
  })
);

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

//  Routes
routes(app);

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (NODE_ENV?.trim() === "development") {
    res.status(statusCode).send({
      error: {
        message: err.message,
        stack: err.stack,
        status: statusCode,
      },
    });
  } else {
    res.status(statusCode).send({
      error: "Internal Server Error",
    });
  }
});

dbConnect()
  .then(async () => {
    console.log("Connected to MongoDB");
    // require('./data/insertDummyData')
    app.listen(PORT, () => console.log(`Listenning to port ${PORT}...`));
  })
  .catch((err) => console.log("Db Connection Error: " + err));
