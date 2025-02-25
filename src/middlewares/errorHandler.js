/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

/**
 * Send detailed error response in development mode
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.statusCode,
    error: err,
    stack: err.stack, 
  });
};

/**
 * Send sanitized error response in production mode
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.statusCode,
      details: err.details || null, 
    });
  } else {
    console.error("ERROR 💥", err); 
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      code: 500,
    });
  }
};

module.exports = errorHandler;
