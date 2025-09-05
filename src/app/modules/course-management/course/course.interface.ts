import mongoose, { Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  thumbnail: string; 
  modules: mongoose.Schema.Types.ObjectId[];
}