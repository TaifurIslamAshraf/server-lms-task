import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import fileDelete from "../utils/fileDelete";

const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      return next();
    } catch (error) {
      fileDelete(req, next);
      next(error);
    }
  };

export default validateRequest;
