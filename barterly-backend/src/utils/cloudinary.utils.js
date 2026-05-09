import cloudinary from "../config/cloudinary.js";
import { AppError } from "./apiResponse.utils.js";

/**
 * Upload image to Cloudinary from base64 or buffer
 * @param {String|Buffer} file - Base64 string or buffer
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Object} Cloudinary upload result
 */
export const uploadToCloudinary = async (
  file,
  folder = "barterly",
  options = {},
) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: "auto",
      ...options,
    };

    // If file is a base64 string
    if (typeof file === "string") {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // If file is a buffer, convert to base64
    if (Buffer.isBuffer(file)) {
      const base64 = `data:image/png;base64,${file.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, uploadOptions);
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    throw new AppError("Invalid file format", 400);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new AppError("Failed to upload image", 500);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Object} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new AppError("Failed to delete image", 500);
  }
};

/**
 * Upload avatar to Cloudinary with transformations
 * @param {String} base64Image - Base64 image string
 * @param {String} userId - User ID for unique naming
 * @returns {Object} Upload result with URL and public_id
 */
export const uploadAvatar = async (base64Image, userId) => {
  try {
    // Validate base64 format
    if (!base64Image || !base64Image.startsWith("data:image/")) {
      throw new AppError(
        "Invalid image format. Please provide a valid base64 image.",
        400,
      );
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "barterly/avatars",
      public_id: `avatar_${userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to upload avatar", 500);
  }
};

/**
 * Validate image size and format from base64
 * @param {String} base64Image - Base64 image string
 * @param {Number} maxSizeMB - Maximum size in MB (default: 2MB)
 * @returns {Boolean} True if valid
 */
export const validateImage = (base64Image, maxSizeMB = 2) => {
  try {
    // Check if it's a valid base64 image
    if (!base64Image || !base64Image.startsWith("data:image/")) {
      throw new AppError("Invalid image format", 400);
    }

    // Extract format
    const formatMatch = base64Image.match(/data:image\/(\w+);base64,/);
    if (!formatMatch) {
      throw new AppError("Invalid image format", 400);
    }

    const format = formatMatch[1].toLowerCase();
    const allowedFormats = ["jpg", "jpeg", "png", "webp"];

    if (!allowedFormats.includes(format)) {
      throw new AppError(
        "Invalid image format. Allowed: jpg, jpeg, png, webp",
        400,
      );
    }

    // Calculate size (base64 is ~1.37x larger than actual file)
    const base64Data = base64Image.split(",")[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > maxSizeMB) {
      throw new AppError(`Image size must be less than ${maxSizeMB}MB`, 400);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid image", 400);
  }
};
