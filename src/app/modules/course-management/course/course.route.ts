import { Router } from "express";
import { isAuthenticated } from "../../../middlewares/authGuards";
import { authorizeUser } from "../../../middlewares/authGuards";
import validateRequest from "../../../middlewares/validateRequest";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getPublicCourseById,
  updateCourse,
} from "./course.controller";
import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseByIdSchema,
  searchCourseSchema,
  updateCourseSchema,
} from "./course.validation";

const router = Router();

// Public routes - for user panel (browsing and preview)
router.get("/public/preview", validateRequest(searchCourseSchema), getAllCourses);
router.get("/:id/preview", validateRequest(getCourseByIdSchema), getPublicCourseById);

// Protected routes - admin only
router.get("/", isAuthenticated, authorizeUser("admin"), validateRequest(searchCourseSchema), getAllCourses);
router.get("/:id", isAuthenticated, authorizeUser("admin"), validateRequest(getCourseByIdSchema), getCourseById);
router.post("/", isAuthenticated, authorizeUser("admin"), validateRequest(createCourseSchema), createCourse);
router.put("/:id", isAuthenticated, authorizeUser("admin"), validateRequest(updateCourseSchema), updateCourse);
router.delete("/:id", isAuthenticated, authorizeUser("admin"), validateRequest(deleteCourseSchema), deleteCourse);

export default router;