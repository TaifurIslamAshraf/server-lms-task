import mongoose, { Document } from 'mongoose';

export interface IModule extends Document {
  title: string;
  description?: string;
  moduleNumber: number;
  courseId: mongoose.Schema.Types.ObjectId;
  lectures: mongoose.Schema.Types.ObjectId[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}