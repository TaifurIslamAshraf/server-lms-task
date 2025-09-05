import httpStatus from "http-status";
import ApiError from "../../../errorHandlers/ApiError";
import ModuleModel from "../course-module/module.model";
import { ILecture } from "./lecture.interface";
import Lecture from "./lecture.model";

const createLecture = async (payload: Partial<ILecture>): Promise<ILecture> => {
  try {
    // Verify module exists
    const module = await ModuleModel.findById(payload.moduleId);
    if (!module) {
      throw new ApiError(httpStatus.NOT_FOUND, "Module not found");
    }

    // Set course ID from module
    payload.courseId = module.courseId as any;

    // Validate video URL format (supports YouTube & general URL)
    if (payload.videoUrl) {
      const isValidUrl = validateVideoUrl(payload.videoUrl);
      if (!isValidUrl) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid video URL format");
      }
    }

    const lecture = await Lecture.create(payload);
    return lecture;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Lecture order number already exists in this module"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create lecture"
    );
  }
};

const getAllLectures = async (): Promise<ILecture[]> => {
  const lectures = await Lecture.find()
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title')
    .sort({ order: 1 });

  return lectures;
};

const getLectureById = async (id: string): Promise<ILecture> => {
  const lecture = await Lecture.findById(id)
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title');

  if (!lecture) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lecture not found");
  }

  return lecture;
};

const getLecturesByModuleId = async (moduleId: string): Promise<ILecture[]> => {
  // Verify module exists
  const module = await ModuleModel.findById(moduleId);
  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, "Module not found");
  }

  const lectures = await Lecture.find({ moduleId })
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title')
    .sort({ order: 1 });

  return lectures;
};

const getLecturesByCourseId = async (courseId: string): Promise<ILecture[]> => {
  const lectures = await Lecture.find({ courseId })
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title')
    .sort({ 'moduleId.moduleNumber': 1, order: 1 });

  return lectures;
};

const updateLecture = async (
  id: string,
  payload: Partial<ILecture>
): Promise<ILecture> => {
  try {
    // Validate video URL if provided
    if (payload.videoUrl) {
      const isValidUrl = validateVideoUrl(payload.videoUrl);
      if (!isValidUrl) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid video URL format");
      }
    }

    const lecture = await Lecture.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('moduleId', 'title moduleNumber')
      .populate('courseId', 'title');

    if (!lecture) {
      throw new ApiError(httpStatus.NOT_FOUND, "Lecture not found");
    }

    return lecture;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Lecture order number already exists in this module"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update lecture"
    );
  }
};

const deleteLecture = async (id: string): Promise<ILecture> => {
  const lecture = await Lecture.findByIdAndDelete(id);

  if (!lecture) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lecture not found");
  }

  return lecture;
};

const reorderLectures = async (moduleId: string): Promise<ILecture[]> => {
  try {
    // Get all lectures for the module
    const lectures = await Lecture.find({ moduleId }).sort({ order: 1 });

    // Update order numbers sequentially
    const updatedLectures = [];
    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      if (lecture.order !== i + 1) {
        lecture.order = i + 1;
        await lecture.save();
      }
      updatedLectures.push(lecture);
    }

    return updatedLectures;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to reorder lectures"
    );
  }
};

const addPDFNote = async (lectureId: string, pdfPath: string): Promise<ILecture> => {
  const lecture = await Lecture.findByIdAndUpdate(
    lectureId,
    { $push: { pdfNotes: pdfPath } },
    { new: true, runValidators: true }
  )
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title');

  if (!lecture) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lecture not found");
  }

  return lecture;
};

const removePDFNote = async (lectureId: string, pdfPath: string): Promise<ILecture> => {
  const lecture = await Lecture.findByIdAndUpdate(
    lectureId,
    { $pull: { pdfNotes: pdfPath } },
    { new: true, runValidators: true }
  )
    .populate('moduleId', 'title moduleNumber')
    .populate('courseId', 'title');

  if (!lecture) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lecture not found");
  }

  return lecture;
};

// Helper function to validate video URLs
const validateVideoUrl = (url: string): boolean => {
  // Support YouTube URLs and general video URLs
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const generalUrlRegex = /^https?:\/\/.+\..+/;

  return youtubeRegex.test(url) || generalUrlRegex.test(url);
};

export const LectureServices = {
  createLecture,
  getAllLectures,
  getLectureById,
  getLecturesByModuleId,
  getLecturesByCourseId,
  updateLecture,
  deleteLecture,
  reorderLectures,
  addPDFNote,
  removePDFNote,
};