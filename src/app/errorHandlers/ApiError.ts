import { TErrorMessage } from "../../types/error";

class ApiError extends Error {
  statusCode: number;
  errorMessages: TErrorMessage[];
  validationErrors?: TErrorMessage[];
  path?: string;
  errorCode?: string;
  stack?: string;

  constructor(
    statusCode: number,
    message: string | TErrorMessage[],
    stack = ""
  ) {
    super(typeof message === "string" ? message : message[0].message);
    this.statusCode = statusCode;
    this.errorMessages = Array.isArray(message) ? message : [{ message }];
    this.validationErrors = [];
    this.path = "";
    this.errorCode = "INTERNAL_ERROR";

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
