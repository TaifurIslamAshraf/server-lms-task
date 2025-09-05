import { TIErrorResponse, TErrorMessage } from "../../types/error";
import ApiError from "./ApiError";

interface ErrorMessage {
  path: string;
  message: string;
  code?: string;
}

const handleApiError = (err: ApiError): TIErrorResponse => {
  const errorMessages: ErrorMessage[] = [];

  // Handle validation errors
  if (err.validationErrors && err.validationErrors.length > 0) {
    errorMessages.push(
      ...err.validationErrors.map((error: TErrorMessage) => ({
        path: error.path || "",
        message: error.message,
        code: error.code || "VALIDATION_ERROR",
      }))
    );
  } else {
    // Handle regular API errors
    errorMessages.push({
      path: err.path || "",
      message: err.message,
      code: err.errorCode || "INTERNAL_ERROR",
    });
  }

  return {
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    errorMessages,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  };
};

export default handleApiError;
