import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../middlewares/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { LectureServices } from "./lecture.service";
import Course from "../course/course.model";

// Create a new lecture
export const createLecture = catchAsync(async (req: Request, res: Response) => {
  const lectureData = req.body;
  const lecture = await LectureServices.createLecture(lectureData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Lecture created successfully",
    data: lecture,
  });
});

// Get all lectures
export const getAllLectures = catchAsync(async (req: Request, res: Response) => {
  const lectures = await LectureServices.getAllLectures();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lectures retrieved successfully",
    data: lectures,
  });
});

// Get a single lecture by ID
export const getLectureById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const lecture = await LectureServices.getLectureById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lecture retrieved successfully",
    data: lecture,
  });
});

// Get lectures by module ID
export const getLecturesByModuleId = catchAsync(
  async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const lectures = await LectureServices.getLecturesByModuleId(moduleId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Lectures retrieved successfully",
      data: lectures,
    });
  }
);

// Get lectures by course ID
export const getLecturesByCourseId = catchAsync(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const lectures = await LectureServices.getLecturesByCourseId(courseId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Lectures retrieved successfully",
      data: lectures,
    });
  }
);

// Update a lecture
export const updateLecture = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const lecture = await LectureServices.updateLecture(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lecture updated successfully",
    data: lecture,
  });
});

// Delete a lecture
export const deleteLecture = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const lecture = await LectureServices.deleteLecture(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lecture deleted successfully",
    data: lecture,
  });
});

// Reorder lectures within a module
export const reorderLectures = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const lectures = await LectureServices.reorderLectures(moduleId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lectures reordered successfully",
    data: lectures,
  });
});

// Add a PDF note to lecture
export const addPDFNote = catchAsync(async (req: Request, res: Response) => {
  const { id: lectureId } = req.params;
  const { pdfPath } = req.body;
  const lecture = await LectureServices.addPDFNote(lectureId, pdfPath);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "PDF note added successfully",
    data: lecture,
  });
});

// Remove a PDF note from lecture
export const removePDFNote = catchAsync(async (req: Request, res: Response) => {
  const { id: lectureId } = req.params;
  const { pdfPath } = req.body;
  const lecture = await LectureServices.removePDFNote(lectureId, pdfPath);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "PDF note removed successfully",
    data: lecture,
  });
});

// Get all courses with their modules and lectures
export const getAllCoursesWithModulesAndLectures = catchAsync(async (req: Request, res: Response) => {
  try {
    const coursesWithModulesAndLectures = await Course.aggregate([
      // Lookup modules for each course
      {
        $lookup: {
          from: 'modules',
          localField: '_id',
          foreignField: 'courseId',
          as: 'modules'
        }
      },
      // Lookup lectures for each module
      {
        $unwind: {
          path: '$modules',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'lectures',
          localField: 'modules._id',
          foreignField: 'moduleId',
          as: 'modules.lectures'
        }
      },
      // Group back by course
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          description: { $first: '$description' },
          instructor: { $first: '$instructor' },
          price: { $first: '$price' },
          thumbnail: { $first: '$thumbnail' },
          level: { $first: '$level' },
          category: { $first: '$category' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          modules: { $push: '$modules' }
        }
      },
      // Sort modules and lectures
      {
        $sort: { title: 1 }
      }
    ]);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Courses with modules and lectures retrieved successfully",
      data: coursesWithModulesAndLectures,
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve courses with modules and lectures",
      data: null,
    });
  }
});