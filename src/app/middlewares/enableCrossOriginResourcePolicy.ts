import { RequestHandler } from "express";

const enableCrossOriginResourcePolicy: RequestHandler = async (
  req,
  res,
  next: () => void
) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
};

export default enableCrossOriginResourcePolicy;
