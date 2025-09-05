import { NextFunction, Request, Response } from "express";

const parseFormData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file as Express.Multer.File;
    const files = req.file as unknown as Express.Multer.File[];

    if (file) {
      const fieldName = file.fieldname;
      const image = {
        src: file.path,
        alt: file.originalname,
      };

      if (!req.body.image) {
        req.body.image = {};
      }

      req.body.image[fieldName] = image;
    }
    if (files && files.length > 1) {
      const images = files.reduce(
        (acc, file) => {
          acc[file.fieldname] = acc[file.fieldname] || [];

          acc[file.fieldname].push({
            src: file.path,
            alt: file.originalname,
          });

          return acc;
        },
        {} as Record<string, { src: string; alt: string }[]>
      );

      if (!req.body.images) {
        req.body.images = {};
      }

      req.body.images = images;
    }
  } catch (error) {
    return next(error);
  }
};

export default parseFormData;
