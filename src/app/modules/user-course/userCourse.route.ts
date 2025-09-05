import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authGuards";
import { authorizeUser } from "../../middlewares/authGuards";
import validateRequest from "../../middlewares/validateRequest";
import {
  approveEnrollment,
  checkEnrollment,
  enrollInCourse,
  getCourseStatistics,
  getPendingEnrollments,
  getUserCourseDetails,
  getUserEnrolledCourses,
  rejectEnrollment,
  syncUserProgress,
} from "./userCourse.controller";
import {
  courseIdParamSchema,
  enrollCourseSchema,
  syncProgressSchema,
} from "./userCourse.validation";

const router = Router();

// All user course routes require authentication
router.use(isAuthenticated);

// User enrolled courses dashboard
router.get("/my-learning",  getUserEnrolledCourses);

// Single course details and progress
router.get("/course/:courseId", validateRequest(courseIdParamSchema), getUserCourseDetails);

// Sync progress (video completion, etc.)
router.put("/progress-sync", validateRequest(syncProgressSchema), syncUserProgress);

// Enroll in course
router.post("/enroll", validateRequest(enrollCourseSchema), enrollInCourse);

// Check enrollment status
router.get("/enrollment/:courseId/check", validateRequest(courseIdParamSchema), checkEnrollment);

// Admin routes (require admin authorization)
const adminAuth = authorizeUser("admin");

// Admin: Course statistics
router.get("/admin/stats/:courseId", isAuthenticated, adminAuth, validateRequest(courseIdParamSchema), getCourseStatistics);

// Admin: Enrollment Management
router.get("/admin/pending-enrollments", isAuthenticated, adminAuth, getPendingEnrollments);
router.post("/admin/approve-enrollment", isAuthenticated, adminAuth, approveEnrollment);
router.post("/admin/reject-enrollment", isAuthenticated, adminAuth, rejectEnrollment);

export default router;