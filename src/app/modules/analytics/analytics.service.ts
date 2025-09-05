import { IAnalytics } from "./analytics.interface";
import Course from "../course-management/course/course.model";

// Note: Assuming User model exists and UserCourse model exists for enrollment tracking
// Import these models as they become available in your project
const getAnalyticsData = async (): Promise<IAnalytics> => {
  try {
    // Get total course count
    const courseCount = await Course.countDocuments({ isActive: { $ne: false } });

    // Get total user count (placeholder - implement when User model is available)
    const userCount = 0; // Replace with: await User.countDocuments({ isActive: { $ne: false } });

    // Get total enrolled courses (placeholder - implement when UserCourse model is available)
    const enrolledCourses = 0; // Replace with: await UserCourse.countDocuments({ isEnrolled: true });

    return {
      userCount,
      courseCount,
      enrolledCourses,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data");
  }
};

export const AnalyticsServices = {
  getAnalyticsData,
};