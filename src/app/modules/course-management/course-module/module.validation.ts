import { z } from "zod";

// Module validation schemas
export const createModuleSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Module title must be at least 3 characters"),
    courseId: z.string().min(1, "Course ID is required"),
    isActive: z.boolean().optional(),
  }),
});

export const updateModuleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Module ID is required"),
  }),
  body: z.object({
    title: z.string().min(3, "Module title must be at least 3 characters").optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getModuleByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Module ID is required"),
  }),
});

export const getModulesByCourseIdSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});

export const deleteModuleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Module ID is required"),
  }),
});

export const reorderModulesSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});