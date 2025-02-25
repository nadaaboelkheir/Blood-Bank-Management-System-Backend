const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const sanitizer = require("perfect-express-sanitizer");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/env");
const dbConnect = require("./config/db");
const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
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
  next(new AppError("route Not Found", 404));
});

// Global error handler for uncaught errors
app.use(errorHandler);

dbConnect()
  .then(async () => {
    console.log("Connected to MongoDB");
    // require('./data/insertDummyData')
    
    app.listen(PORT, () => console.log(`Listenning to port ${PORT}...`));
  })
  .catch((err) => console.log("Db Connection Error: " + err));
