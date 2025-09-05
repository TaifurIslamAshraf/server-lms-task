import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../../errorHandlers/ApiError";
import { ICourse } from "./course.interface";
import Course from "./course.model";

const createCourse = async (payload: Partial<ICourse>): Promise<ICourse> => {
  try {
    const course = await Course.create(payload);
    return course;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Course with this title already exists"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create course"
    );
  }
};

const getAllCourses = async (search?: string): Promise<ICourse[]> => {
  let query = {};

  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    };
  }

  const courses = await Course.find(query)
  return courses;
};

const getCourseById = async (id: string): Promise<ICourse> => {
  const course = await Course.findById(id)
    .populate({
      path: 'modules',
      select: 'title moduleNumber isActive',
      populate: {
        path: 'lectures',
        select: 'title videoUrl pdfNotes duration order isActive',
        match: { isActive: true }
      }
    });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

const getPublicCourseById = async (id: string): Promise<any> => {

  const result = await Course.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) }
    },
    {
      $lookup: {
        from: 'modules',
        localField: '_id',
        foreignField: 'courseId',
        as: 'modules',
        pipeline: [
          {
            $match: { isActive: true }
          },
          {
            $lookup: {
              from: 'lectures',
              let: { moduleId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$moduleId', '$$moduleId'] },
                        { $eq: ['$isActive', true] }
                      ]
                    }
                  }
                },
                {
                  $sort: { order: 1 }
                },
                {
                  $project: {
                    title: 1,
                    duration: 1,
                    order: 1,
                    isActive: 1
                  }
                }
              ],
              as: 'lectures'
            }
          },
          {
            $project: {
              title: 1,
              moduleNumber: 1,
              isActive: 1,
              lectures: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        price: 1,
        thumbnail: 1,
        createdAt: 1,
        updatedAt: 1,
        modules: 1
      }
    }
  ]);

  if (!result || result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return result[0];
};

const updateCourse = async (
  id: string,
  payload: Partial<ICourse>
): Promise<ICourse> => {
  try {
    const course = await Course.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('modules');

    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
    }

    return course;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Course with this title already exists"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update course"
    );
  }
};

const deleteCourse = async (id: string): Promise<ICourse> => {
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};


export const CourseServices = {
  createCourse,
  getAllCourses,
  getCourseById,
  getPublicCourseById,
  updateCourse,
  deleteCourse,
};