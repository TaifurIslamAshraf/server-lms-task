import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../middlewares/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { CourseServices } from "./course.service";

// Create a new course
export const createCourse = catchAsync(async (req: Request, res: Response) => {
  const courseData = req.body;
  const course = await CourseServices.createCourse(courseData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Course created successfully",
    data: course,
  });
});

// Get all courses
export const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const { search } = req.query;
  const courses = await CourseServices.getAllCourses(search as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Courses retrieved successfully",
    data: courses,
  });
});

// Get a single course by ID (Admin - Full Details)
export const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await CourseServices.getCourseById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course retrieved successfully",
    data: course,
  });
});

// Get course by ID (Public - Limited Details)
export const getPublicCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await CourseServices.getPublicCourseById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course preview retrieved successfully",
    data: course,
  });
});

// Update a course
export const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const course = await CourseServices.updateCourse(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course updated successfully",
    data: course,
  });
});

// Delete a course
export const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await CourseServices.deleteCourse(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course deleted successfully",
    data: course,
  });
});
