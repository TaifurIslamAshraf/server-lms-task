import { NextFunction, Request, RequestHandler, Response } from "express";
import fileDelete from "../utils/fileDelete";

const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      fileDelete(req, next);
      next(err);
    });
  };
};

export default catchAsync;
