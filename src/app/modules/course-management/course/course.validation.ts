import { z } from "zod";

// Course validation schemas
export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Course title must be at least 3 characters"),
    description: z.string().min(10, "Course description must be at least 10 characters"),
    price: z.number().min(0, "Price cannot be negative"),
    thumbnail: z.string().url("Invalid thumbnail URL").or(z.string().min(1, "Thumbnail is required")),
    instructor: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    category: z.string().optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Course ID is required"),
  }),
  body: z.object({
    title: z.string().min(3, "Course title must be at least 3 characters").optional(),
    description: z.string().min(10, "Course description must be at least 10 characters").optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    instructor: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    category: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
  }),
});

export const getCourseByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Course ID is required"),
  }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Course ID is required"),
  }),
});

export const searchCourseSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});