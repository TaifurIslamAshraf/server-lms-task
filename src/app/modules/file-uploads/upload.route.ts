import { Router } from "express";
import { uploadSingleImage, uploadMultipleImages, uploadFile } from "./upload.controller";

const router = Router();

// POST /api/uploads/image
router.post("/image", uploadSingleImage);

// POST /api/uploads/images
router.post("/images", uploadMultipleImages);

// POST /api/uploads/file
router.post("/file", uploadFile);

export default router;