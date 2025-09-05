import { Document, Types } from "mongoose";

export interface IUserCourse extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  enrolledAt: Date;
  isEnrolled: boolean; // Requires admin approval
  completed: boolean;
  progress: number;
  videosCompleted: Types.ObjectId[];
  currentVideo?: string;
  quizScores?: {
    quizId: Types.ObjectId;
    score: number;
    completedAt: Date;
  }[];
}

export interface ICreateUserCourse {
  user: Types.ObjectId;
  course: Types.ObjectId[];
}

export interface ISyncProgress {
  course: string;
  completed?: boolean;
  videosCompleted?: Types.ObjectId[];
  currentVideo?: string;
}