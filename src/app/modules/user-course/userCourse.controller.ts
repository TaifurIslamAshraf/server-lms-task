import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../middlewares/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserCourseServices } from "./userCourse.service";
import UserCourse from "./userCourse.model";

// Get all enrolled courses for authenticated user
export const getUserEnrolledCourses = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const courses = await UserCourseServices.getUserCourses(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User enrolled courses retrieved successfully",
    data: courses,
  });
});

// Get single user course enrollment details with full course content if enrolled
export const getUserCourseDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const { courseId } = req.params;
  const courseEnrollment = await UserCourseServices.getSingleUserCourse(courseId, userId);

  // Provide different messages based on enrollment status
  let message = "User course details retrieved successfully";
  let courseData: any = courseEnrollment.course;

  if (!courseEnrollment.isEnrolled) {
    message = "Course enrollment is pending admin approval";
    // For pending approvals, return limited course data
    const populatedCourse = (courseEnrollment as any).course as {
      title?: string;
      description?: string;
      thumbnail?: string;
      price?: number;
    };
    courseData = {
      title: populatedCourse?.title,
      description: populatedCourse?.description,
      thumbnail: populatedCourse?.thumbnail,
      price: populatedCourse?.price,
    };
  } else {
    message = "Enrolled course with full content retrieved successfully";
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message,
    data: {
      enrollment: courseEnrollment,
      course: courseData,
      isEnrolled: courseEnrollment.isEnrolled,
      progress: courseEnrollment.progress,
      completed: courseEnrollment.completed,
      // Include module and lecture data if enrolled
      ...(courseEnrollment.isEnrolled && (courseEnrollment as any).course && {
        modules: (courseEnrollment as any).course.modules,
      }),
    },
  });
});

// Sync user progress
export const syncUserProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const progressData = req.body;
  const updatedEnrollment = await UserCourseServices.syncUserProgress(progressData, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User progress synchronized successfully",
    data: updatedEnrollment,
  });
});

// Enroll in course (called after purchase/payment) - Pending Admin Approval
export const enrollInCourse = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const courseId = req.body.courseId;

  // Check enrollment status
  const enrollmentStatus = await UserCourseServices.getEnrollmentStatus(userId, courseId);
  if (enrollmentStatus.status === 'approved') {
    throw new Error("User already enrolled in this course");
  }
  if (enrollmentStatus.status === 'pending') {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Enrollment request is already pending admin approval.",
      data: { enrollmentId: enrollmentStatus.enrollmentId, status: 'pending' },
    });
    return;
  }

  const enrollment = await UserCourseServices.enrollUserInCourses({
    user: userId,
    course: [courseId]
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Enrollment request submitted. Pending admin approval.",
    data: enrollment[0],
  });
});

// Get course statistics (for admin dashboard)
export const getCourseStatistics = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const stats = await UserCourseServices.getCourseStatistics(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course statistics retrieved successfully",
    data: stats,
  });
});

// Check if user is enrolled in course
export const checkEnrollment = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.user._id;
  const { courseId } = req.params;
  const isEnrolled = await UserCourseServices.isUserEnrolled(userId, courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: isEnrolled ? "User is enrolled" : "User is not enrolled",
    data: { enrolled: isEnrolled },
  });
});

// Admin: Approve user enrollment in course
export const approveEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;
  const updatedEnrollment = await UserCourse.findOneAndUpdate(
    { user: userId, course: courseId },
    { isEnrolled: true },
    { new: true, runValidators: true }
  ).populate('user', 'name email').populate('course', 'title');

  if (!updatedEnrollment) {
    throw new Error("User enrollment request not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User enrollment approved successfully",
    data: updatedEnrollment,
  });
});

// Admin: Reject user enrollment in course
export const rejectEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;
  await UserCourse.findOneAndDelete({ user: userId, course: courseId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User enrollment rejected and removed",
    data: { userId, courseId },
  });
});

// Admin: Get all pending enrollment requests
export const getPendingEnrollments = catchAsync(async (req: Request, res: Response) => {
  const pendingEnrollments = await UserCourse.find({ isEnrolled: false })
    .populate('user', 'fullName email')
    .populate('course', 'title');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Pending enrollment requests retrieved",
    data: pendingEnrollments,
  });
});