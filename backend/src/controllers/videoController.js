import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a video to upload",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "samvaad/lessons",
        allowed_formats: ["mp4", "webm", "mov"],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);

          return res.status(502).json({
            success: false,
            message: "Failed to upload video to Cloudinary",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Video uploaded successfully",
          video: {
            videoUrl: result.secure_url,
            videoPublicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            duration: result.duration,
          },
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Video upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while uploading video",
    });
  }
};