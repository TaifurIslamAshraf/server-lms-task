export type TErrorMessage = {
  path?: string;
  message: string;
  code?: string;
};

export interface TIErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errorMessages: TErrorMessage[];
  timestamp: string;
  stack?: string;
}
