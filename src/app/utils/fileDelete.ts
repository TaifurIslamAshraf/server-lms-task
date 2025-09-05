import { NextFunction, Request } from "express";
import fsEx from "fs-extra";

const fileDelete = (req: Request, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  if (files?.length) {
    files.forEach(async (file) => {
      const folderPath = file?.path?.split("\\").slice(0, -1).join("\\");
      try {
        await fsEx.remove(folderPath);
      } catch (err) {
        return next(err);
      }
    });
  }
};

export default fileDelete;
