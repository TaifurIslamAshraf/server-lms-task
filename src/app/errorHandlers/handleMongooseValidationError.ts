import httpStatus from "http-status";
import mongoose from "mongoose";
import { TErrorMessage, TIErrorResponse } from "../../types/error";

const handleMongooseValidationError = (
  error: mongoose.Error.ValidationError
): TIErrorResponse => {
  const errorMessages: TErrorMessage[] = Object.values(error.errors).map(
    (
      singleError: mongoose.Error.ValidatorError | mongoose.Error.CastError
    ) => ({
      path: singleError.path,
      message:
        singleError.kind === "ObjectId"
          ? `Invalid ${singleError.path} id`
          : singleError.message.split("`").join(""),
    })
  );
  const modifiedError: TIErrorResponse = {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation error",
    errorMessages,
    success: false,
    timestamp: new Date().toISOString(),
  };
  return modifiedError;
};

export default handleMongooseValidationError;
