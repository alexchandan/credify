import multer from "multer";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

// Memory storage, not disk — files are streamed straight to Cloudinary
// via storageService, never touching the server's filesystem.
const storage = multer.memoryStorage();

const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const resumeUpload: RequestHandler = multer({
  storage,
  limits: { fileSize: RESUME_MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(
        new AppError(
          400,
          "INVALID_FILE_TYPE",
          "Only PDF files are allowed for resumes",
        ),
      );
    }
    cb(null, true);
  },
}).single("resume");

const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const logoUpload: RequestHandler = multer({
  storage,
  limits: { fileSize: LOGO_MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_LOGO_TYPES.has(file.mimetype)) {
      return cb(
        new AppError(
          400,
          "INVALID_FILE_TYPE",
          "Only JPEG, PNG, or WebP images are allowed for logos",
        ),
      );
    }
    cb(null, true);
  },
}).single("logo");
