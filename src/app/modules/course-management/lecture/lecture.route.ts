import { Router } from "express";
import { isAuthenticated } from "../../../middlewares/authGuards";
import { authorizeUser } from "../../../middlewares/authGuards";
import validateRequest from "../../../middlewares/validateRequest";
import {
  addPDFNote,
  createLecture,
  deleteLecture,
  getAllLectures,
  getLectureById,
  getLecturesByCourseId,
  getLecturesByModuleId,
  removePDFNote,
  reorderLectures,
  updateLecture,
  getAllCoursesWithModulesAndLectures,
} from "./lecture.controller";
import {
  addPDFNoteSchema,
  createLectureSchema,
  deleteLectureSchema,
  getLectureByIdSchema,
  getLecturesByCourseIdSchema,
  getLecturesByModuleIdSchema,
  removePDFNoteSchema,
  reorderLecturesSchema,
  updateLectureSchema,
} from "./lecture.validation";

const router = Router();

const requireAdmin = authorizeUser("admin");

// All routes are admin-only and protected
router.get("/", isAuthenticated, requireAdmin, getAllLectures);
router.get("/courses-with-modules-and-lectures", isAuthenticated, requireAdmin, getAllCoursesWithModulesAndLectures);
router.get("/:id", isAuthenticated, requireAdmin, validateRequest(getLectureByIdSchema), getLectureById);
router.get("/module/:moduleId", isAuthenticated, requireAdmin, validateRequest(getLecturesByModuleIdSchema), getLecturesByModuleId);
router.get("/course/:courseId", isAuthenticated, requireAdmin, validateRequest(getLecturesByCourseIdSchema), getLecturesByCourseId);

router.post("/", isAuthenticated, requireAdmin, validateRequest(createLectureSchema), createLecture);
router.put("/:id", isAuthenticated, requireAdmin, validateRequest(updateLectureSchema), updateLecture);
router.delete("/:id", isAuthenticated, requireAdmin, validateRequest(deleteLectureSchema), deleteLecture);

// Special admin routes for organization
router.post("/module/:moduleId/reorder", isAuthenticated, requireAdmin, validateRequest(reorderLecturesSchema), reorderLectures);
router.post("/:id/add-pdf", isAuthenticated, requireAdmin, validateRequest(addPDFNoteSchema), addPDFNote);
router.post("/:id/remove-pdf", isAuthenticated, requireAdmin, validateRequest(removePDFNoteSchema), removePDFNote);

export default router;