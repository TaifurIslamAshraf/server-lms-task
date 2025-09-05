import httpStatus from "http-status";
import mongoose from "mongoose";
import { TErrorMessage, TIErrorResponse } from "../../types/error";

const handleMongooseCastError = (
  err: mongoose.Error.CastError
): TIErrorResponse => {
  const message = "Invalid Id";
  const errorMessages: TErrorMessage[] = [
    {
      path: err.path,
      message,
    },
  ];
  return {
    statusCode: httpStatus.BAD_REQUEST,
    message,
    errorMessages,
    success: false,
    timestamp: new Date().toISOString(),
  };
};

export default handleMongooseCastError;
