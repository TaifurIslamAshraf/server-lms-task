import { Router } from "express";
import { authorizeUser, isAuthenticated } from "../../../middlewares/authGuards";
import validateRequest from "../../../middlewares/validateRequest";
import {
  createModule,
  deleteModule,
  getAllCoursesWithModules,
  getAllModules,
  getModuleById,
  getModulesByCourseId,
  reorderModules,
  updateModule,
} from "./module.controller";
import {
  createModuleSchema,
  deleteModuleSchema,
  getModuleByIdSchema,
  getModulesByCourseIdSchema,
  reorderModulesSchema,
  updateModuleSchema,
} from "./module.validation";

const router = Router();


router.get("/",isAuthenticated, authorizeUser("admin"), getAllModules);
router.get("/courses-with-modules", isAuthenticated, authorizeUser("admin"), getAllCoursesWithModules);
router.get("/:id",isAuthenticated, authorizeUser("admin"), validateRequest(getModuleByIdSchema), getModuleById);
router.get("/course/:courseId",isAuthenticated, authorizeUser("admin"), validateRequest(getModulesByCourseIdSchema), getModulesByCourseId);

// Protected routes - admin only
router.post("/", isAuthenticated, authorizeUser("admin"), validateRequest(createModuleSchema), createModule);
router.put("/:id", isAuthenticated,authorizeUser("admin"), validateRequest(updateModuleSchema), updateModule);
router.delete("/:id", isAuthenticated,authorizeUser("admin"), validateRequest(deleteModuleSchema), deleteModule);

// Special admin route for reordering modules
router.post("/course/:courseId/reorder",authorizeUser("admin"), isAuthenticated, validateRequest(reorderModulesSchema), reorderModules);

export default router;
