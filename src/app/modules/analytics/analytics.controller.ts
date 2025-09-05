import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../middlewares/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnalyticsServices } from "./analytics.service";

// Get analytics data - user count, course count, enrolled courses count
export const getAnalyticsData = catchAsync(async (req: Request, res: Response) => {
  const analyticsData = await AnalyticsServices.getAnalyticsData();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Analytics data retrieved successfully",
    data: analyticsData,
  });
});