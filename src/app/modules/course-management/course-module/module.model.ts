import mongoose, { Model, Schema } from 'mongoose';
import { IModule } from './module.interface';

const moduleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    moduleNumber: {
      type: Number,
      required: [true, 'Module number is required'],
      min: [1, 'Module number must be at least 1'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
      },
    ],
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



// Add indexes for better performance
moduleSchema.index({ courseId: 1 });
moduleSchema.index({ courseId: 1, moduleNumber: 1 }, { unique: true });

const ModuleModel: Model<IModule> = mongoose.model<IModule>('Module', moduleSchema);
export default ModuleModel;