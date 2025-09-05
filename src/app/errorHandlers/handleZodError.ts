import httpStatus from "http-status";
import { ZodError, ZodIssue } from "zod";
import { TErrorMessage, TIErrorResponse } from "../../types/error";

const handleZodError = (err: ZodError): TIErrorResponse => {
  const errorMessages: TErrorMessage[] = err.issues?.map((issue: ZodIssue) => ({
    path: `${String(issue?.path[issue?.path.length - 1])}`,
    message: issue?.message,
  }));

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation Error",
    errorMessages,
    success: false,
    timestamp: new Date().toISOString(),
  };
};

export default handleZodError;
