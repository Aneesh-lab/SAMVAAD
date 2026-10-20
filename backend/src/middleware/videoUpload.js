import multer from "multer";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const videoUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedVideoTypes.includes(file.mimetype)) {
      return callback(
        new Error(
          "Unsupported video format. Please upload MP4, WebM, or MOV."
        )
      );
    }

    callback(null, true);
  },
});

export default videoUpload;