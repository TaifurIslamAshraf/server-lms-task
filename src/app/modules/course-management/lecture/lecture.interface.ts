import { Document, Types } from "mongoose";

export interface ILecture extends Document {
  title: string;
  moduleId: Types.ObjectId;
  courseId: Types.ObjectId;
  videoUrl: string; // YouTube embed URL or local video path
  pdfNotes: string[]; // Array of PDF file paths
  duration?: number; // Video duration in seconds
  order: number; // Lecture order within module
  isActive: boolean;
}