import User from "../models/User.js";

// Get all students and support searching
export const getAllStudents = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const filter = {
      role: "student",
    };

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const students = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get all students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
    });
  }
};

// Get one student's details
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      _id: id,
      role: "student",
    })
      .select("-password")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    console.error("Get student details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student details.",
    });
  }
};