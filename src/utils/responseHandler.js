const sendSuccess = (res, data = null, statusCode = 200, message = "Success") => {
  const response = {
    success: true,
    message,
    code: statusCode,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

module.exports = { sendSuccess };
