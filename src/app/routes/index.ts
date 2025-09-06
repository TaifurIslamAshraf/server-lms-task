import { Router } from "express";

import authRouter from "../modules/auth/auth.route";
import userRouter from "../modules/users/user.route";
import analyticsRouter from "../modules/analytics/analytics.route";
import courseRouter from "../modules/course-management/course/course.route";
import moduleRouter from "../modules/course-management/course-module/module.route";
import userCourseRouter from "../modules/user-course/userCourse.route";
import lectureRouter from "../modules/course-management/lecture/lecture.route";

const router = Router();



const moduleRoutes = [
    {
      path: "/user",
      route: userRouter,
    },
    {
      path: "/analytics",
      route: analyticsRouter,
    },
    {
      path: "/auth",
      route: authRouter,
    },
    {
      path: "/courses",
      route: courseRouter,
    },
    {
      path: "/modules",
      route: moduleRouter,
    },
    {
      path: "/lectures",
      route: lectureRouter,
    },
    {
      path: "/learning",
      route: userCourseRouter,
    },
  

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));


export default router;
