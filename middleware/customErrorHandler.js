import CustomErrorHandlerAPI from "../helpers/customErrorHandlerAPI.js";

const customErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // mongoose bad objectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new CustomErrorHandlerAPI(message, 404);
  }

  if (err.code === 11000) {
    const message = "Duplicate fields found.";
    // bad req
    error = new CustomErrorHandlerAPI(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((error) => {
      return error.message;
    });
    console.log(message);
    error = new CustomErrorHandlerAPI(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default customErrorHandler;
