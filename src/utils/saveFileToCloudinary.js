// src/utils/saveFileToCloudinary.js
import { v2 as cloudinary } from 'cloudinary';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Завантажує файл у Cloudinary з буфера.
 * Повертає об'єкт результату (result), де є secure_url, public_id тощо.
 */
export function saveFileToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'image',
        overwrite: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}
