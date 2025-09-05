import { Response } from "express";
import { TSuccessResponse } from "../../types/utilities";

const sendResponse = <T>(res: Response, data: TSuccessResponse<T>) => {
  const responseData: TSuccessResponse<T> = {
    statusCode: data.statusCode,
    success: true,
    message: data?.message || "Response successfull",
    meta: data?.meta || null || undefined,
    data: data?.data || null || undefined,
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
