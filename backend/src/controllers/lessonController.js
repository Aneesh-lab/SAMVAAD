import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";

export const createLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      videoUrl,
      duration,
      order,
      isPublished,
    } = req.body;

    if (!title || !course) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      course,
      videoUrl,
      duration,
      order,
      isPublished,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating lesson",
    });
  }
};


export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lessons = await Lesson.find({
      course: courseId,
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lessons",
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id)
      .populate("course", "title category");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    return res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Get lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lesson",
    });
  }
};


export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      course,
      videoUrl,
      duration,
      order,
      isPublished,
    } = req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // If course is being changed, make sure the new course exists
    if (course && course !== lesson.course.toString()) {
      const existingCourse = await Course.findById(course);

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      lesson.course = course;
    }

    lesson.title = title ?? lesson.title;
    lesson.description = description ?? lesson.description;
    lesson.videoUrl = videoUrl ?? lesson.videoUrl;
    lesson.duration = duration ?? lesson.duration;
    lesson.order = order ?? lesson.order;
    lesson.isPublished =
      isPublished ?? lesson.isPublished;

    await lesson.save();

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating lesson",
    });
  }
};


export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    await Lesson.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting lesson",
    });
  }
};