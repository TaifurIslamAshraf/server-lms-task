import { z } from "zod";

// Lecture validation schemas
export const createLectureSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Lecture title must be at least 3 characters"),
    moduleId: z.string().min(1, "Module ID is required"),
    videoUrl: z.string().url("Invalid video URL format").or(z.string().min(1, "Video URL is required")),
    pdfNotes: z.array(z.string()).optional(),
    duration: z.number().min(0, "Duration cannot be negative").optional(),
    order: z.number().min(1, "Order must be at least 1").optional().default(1),
    isActive: z.boolean().optional(),
  }),
});

export const updateLectureSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Lecture ID is required"),
  }),
  body: z.object({
    title: z.string().min(3, "Lecture title must be at least 3 characters").optional(),
    videoUrl: z.string().url("Invalid video URL format").optional(),
    pdfNotes: z.array(z.string()).optional(),
    duration: z.number().min(0, "Duration cannot be negative").optional(),
    order: z.number().min(1, "Order must be at least 1").optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getLectureByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Lecture ID is required"),
  }),
});

export const getLecturesByModuleIdSchema = z.object({
  params: z.object({
    moduleId: z.string().min(1, "Module ID is required"),
  }),
});

export const getLecturesByCourseIdSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});

export const deleteLectureSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Lecture ID is required"),
  }),
});

export const reorderLecturesSchema = z.object({
  params: z.object({
    moduleId: z.string().min(1, "Module ID is required"),
  }),
});

export const addPDFNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Lecture ID is required"),
  }),
  body: z.object({
    pdfPath: z.string().min(1, "PDF path is required"),
  }),
});

export const removePDFNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Lecture ID is required"),
  }),
  body: z.object({
    pdfPath: z.string().min(1, "PDF path is required"),
  }),
});