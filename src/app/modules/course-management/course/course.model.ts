import mongoose, {  Model, Schema } from 'mongoose';
import {ICourse} from "./course.interface"




const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Course thumbnail URL is required'],
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
      },
    ],
  },
  {
    timestamps: true, 
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);


//indexes
courseSchema.index({ title: 1 }, { unique: true });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ price: 1 });

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
