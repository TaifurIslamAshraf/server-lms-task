import { z } from "zod";

// Validation schemas for user course operations
export const syncProgressSchema = z.object({
  body: z.object({
    course: z.string().min(1, "Course ID is required"),
    completed: z.boolean().optional(),
    videosCompleted: z.array(z.string()).optional(),
    currentVideo: z.string().optional(),
  }),
});

export const enrollCourseSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});