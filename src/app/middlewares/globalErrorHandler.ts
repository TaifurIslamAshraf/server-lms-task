import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { TErrorMessage, TIErrorResponse } from "../../types/error";
import config from "../config/config";
import ApiError from "../errorHandlers/ApiError";
import handleMongooseCastError from "../errorHandlers/handleMongooseCastError";
import handleMongooseDuplicateError from "../errorHandlers/handleMongooseDuplicateError";
import handleMongooseValidationError from "../errorHandlers/handleMongooseValidationError";
import handleZodError from "../errorHandlers/handleZodError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorhandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message =
    "Something went wrong. Please try again later or contact to the support";
  let errorMessages: TErrorMessage[] = [{ path: req.path, message }];

  if (err.name === "ValidationError") {
    const modifiedError = handleMongooseValidationError(err);
    message = modifiedError.message ?? message;
    statusCode = modifiedError.statusCode;
    errorMessages = modifiedError.errorMessages ?? errorMessages;
  } else if (err.name === "CastError") {
    const modifiedError = handleMongooseCastError(err);
    message = modifiedError.message ?? message;
    statusCode = modifiedError.statusCode;
    errorMessages = modifiedError.errorMessages ?? errorMessages;
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    const modifiedError = handleMongooseDuplicateError(err);
    message = modifiedError.message ?? message;
    statusCode = modifiedError.statusCode;
    errorMessages = modifiedError.errorMessages ?? errorMessages;
  } else if (err instanceof ZodError) {
    const modifiedError = handleZodError(err);
    message = modifiedError.message ?? message;
    statusCode = modifiedError.statusCode;
    errorMessages = modifiedError.errorMessages ?? errorMessages;
  } else if (err instanceof ApiError) {
    message = err.message;
    statusCode = err.statusCode;
    errorMessages = err.errorMessages ?? errorMessages;
  }

  const errorResponse: TIErrorResponse = {
    success: false,
    message,
    errorMessages,
    stack: config.app.env === "development" ? err?.stack : undefined,
    timestamp: new Date().toISOString(),
    statusCode,
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorhandler;
