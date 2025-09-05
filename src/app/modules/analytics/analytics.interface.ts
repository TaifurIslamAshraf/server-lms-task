export interface IAnalytics {
  userCount: number;
  courseCount: number;
  enrolledCourses: number;
}

export interface IAnalyticsResponse {
  success: boolean;
  message: string;
  data: IAnalytics;
}