import mongoose, { Model, Schema, model } from 'mongoose';
import { IUserCourse } from './userCourse.interface';

const userCourseSchema = new Schema<IUserCourse>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    isEnrolled: {
      type: Boolean,
      default: false, // Requires admin approval
    },
    completed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    videosCompleted: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lecture',
      }
    ],
    currentVideo: {
      type: String,
    },
    quizScores: [{
      quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
      },
      score: Number,
      completedAt: {
        type: Date,
        default: Date.now,
      }
    }],
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

// Compound indexes for optimization
userCourseSchema.index({ user: 1, course: 1 }, { unique: true });
userCourseSchema.index({ completed: 1 });

// Prevent duplicate enrollment
userCourseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingEnrollment = await UserCourse.findOne({
      user: this.user,
      course: this.course,
    });

    if (existingEnrollment) {
      const error = new Error('User already enrolled in this course');
      next(error);
    }
  }
  next();
});

const UserCourse: Model<IUserCourse> = model<IUserCourse>('UserCourse', userCourseSchema);

// Fix the reference in pre hook
userCourseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const UserCourseModel = mongoose.model('UserCourse');
    const existingEnrollment = await UserCourseModel.findOne({
      user: this.user,
      course: this.course,
    });

    if (existingEnrollment) {
      const error = new Error('User already enrolled in this course');
      next(error);
    }
  }
  next();
});

const UserCourseFinal = model<IUserCourse>('UserCourse', userCourseSchema);
export default UserCourseFinal;