import httpStatus from "http-status";
import ApiError from "../../../errorHandlers/ApiError";
import Course from "../course/course.model";
import { IModule } from "./module.interface";
import ModuleModel from "./module.model";

const ensureModuleIndexes = async (): Promise<void> => {
  try {
    const collection = ModuleModel.collection;

    // Force drop the old single index if it exists
      const indexes = await collection.indexes();
      const oldIndexExists = indexes.some(index => index.name === 'moduleNumber_1' || index.key.moduleNumber);
      if (oldIndexExists) {
        await collection.dropIndex('moduleNumber_1');
      }
   

    // Drop and recreate the compound index to ensure uniqueness
    try {
      const indexes = await collection.indexes();
      const compoundExists = indexes.some(index => index.name === 'courseId_1_moduleNumber_1');
      if (compoundExists) {
        await collection.dropIndex('courseId_1_moduleNumber_1');
      }

      await collection.createIndex(
        { courseId: 1, moduleNumber: 1 },
        {
          unique: true,
          background: false,
          name: 'courseId_1_moduleNumber_1'
        }
      );
    } catch (e) {
      console.error('Error handling compound index:', e);
    }

  } catch (error) {
    console.error('Error ensuring module indexes:', error);
  }
};

const createModule = async (payload: Partial<IModule>): Promise<IModule> => {
  try {
    // Ensure indexes are correct
    await ensureModuleIndexes();

    // Verify course exists
    const course = await Course.findById(payload.courseId);
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
    }

    const module = await ModuleModel.create(payload);
    return module;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Module with this number already exists in the course"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create module"
    );
  }
};

const getAllModules = async (): Promise<IModule[]> => {
  const modules = await ModuleModel.find()
    .populate('courseId', 'title')
    .populate('lectures');
  return modules;
};

const getModuleById = async (id: string): Promise<IModule> => {
  const module = await ModuleModel.findById(id)
    .populate('courseId', 'title')
    .populate('lectures');

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, "Module not found");
  }

  return module;
};

const getModulesByCourseId = async (courseId: string): Promise<IModule[]> => {
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const modules = await ModuleModel.find({ courseId })
    .populate('courseId', 'title')
    .populate('lectures')
    .sort({ moduleNumber: 1 });

  return modules;
};

const updateModule = async (
  id: string,
  payload: Partial<IModule>
): Promise<IModule> => {
  try {
    await ensureModuleIndexes();

    const module = await ModuleModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('courseId', 'title')
      .populate('lectures');

    if (!module) {
      throw new ApiError(httpStatus.NOT_FOUND, "Module not found");
    }

    return module;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Module with this number already exists in the course"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update module"
    );
  }
};

const deleteModule = async (id: string): Promise<IModule> => {
  const module = await ModuleModel.findByIdAndDelete(id);

  if (!module) {
    throw new ApiError(httpStatus.NOT_FOUND, "Module not found");
  }

  return module;
};

const reorderModules = async (courseId: string): Promise<IModule[]> => {
  try {
    // Get all modules for the course
    const modules = await ModuleModel.find({ courseId }).sort({ moduleNumber: 1 });

    // Update moduleNumbers in sequential order
    const updatedModules = [];
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (module.moduleNumber !== i + 1) {
        module.moduleNumber = i + 1;
        await module.save();
      }
      updatedModules.push(module);
    }

    return updatedModules;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to reorder modules"
    );
  }
};

export const ModuleServices = {
  createModule,
  getAllModules,
  getModuleById,
  getModulesByCourseId,
  updateModule,
  deleteModule,
  reorderModules,
};