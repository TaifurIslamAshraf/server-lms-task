import mongoose, { Model, Schema } from 'mongoose';
import { ILecture } from './lecture.interface';

const lectureSchema = new Schema<ILecture>(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    pdfNotes: [{
      type: String,
    }],
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Auto-increment order within module when creating new lecture
lectureSchema.pre('save', async function (next) {
  if (this.isNew && this.order !== undefined) {
    // No need to auto-increment if order is already set
    if (this.order !== 0) {
      next();
      return;
    }

    try {
      const lastLecture = await mongoose.model<ILecture>('Lecture').findOne(
        { moduleId: this.moduleId },
        { order: 1 },
        { sort: { order: -1 } }
      );
      this.order = lastLecture ? lastLecture.order + 1 : 1;
    } catch (error) {
      next(error as Error);
    }
  }
  next();
});

// Add indexes for better performance
lectureSchema.index({ moduleId: 1 });
lectureSchema.index({ courseId: 1 });
lectureSchema.index({ moduleId: 1, order: 1 });
lectureSchema.index({ isActive: 1 });

const LectureModel: Model<ILecture> = mongoose.model<ILecture>('Lecture', lectureSchema);
export default LectureModel;