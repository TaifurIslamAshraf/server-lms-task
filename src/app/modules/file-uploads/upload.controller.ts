import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../middlewares/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { upload as multerUpload } from "../../middlewares/multer";
import config from "../../config/config";

// Upload single image
export const uploadSingleImage = catchAsync(
  async (req: Request, res: Response) => {
    const uploadMiddleware = multerUpload.single("image");
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: err.message,
        });
      }
      if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "No image file provided",
        });
      }

      const filename = req.file.filename;
      const originalname = req.file.originalname;
      const imgPath = req.file.path;
      const size = req.file.size;

      // Generate direct uploads path (no timestamp directories)
      const filePath = `${config.domains.serverUrl}/${imgPath}`;

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Image uploaded successfully",
        data: { filename, url: filePath, path: filePath, size, originalname },
      });
    });
  }
);

// Upload multiple images
export const uploadMultipleImages = catchAsync(
  async (req: Request, res: Response) => {
    const uploadMiddleware = multerUpload.array("images", 10);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: err.message,
        });
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "No image files provided",
        });
      }
      const filePaths = req.files.map((file) => `/uploads/${file.filename}`);

      const responseFiles = req.files.map((file) => ({
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        path: `/uploads/${file.filename}`,
      }));

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Images uploaded successfully",
        data: { filePaths: filePaths, files: responseFiles },
      });
    });
  }
);

// Upload file
export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const uploadMiddleware = multerUpload.single("file");
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: err.message,
      });
    }
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No file provided",
      });
    }
     // Generate direct uploads path (no timestamp directories)
      const filePath = `${config.domains.serverUrl}/${req.file.path}`;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "File uploaded successfully",
      data: { filename: req.file.filename, url: filePath, path: filePath },
    });
  });
});
