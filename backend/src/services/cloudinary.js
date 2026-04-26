import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
import path from 'path';

// Mock Configuration (In a real app, use actual credentials)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// Use memory storage for processing before upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

export const uploadToCloudinary = async (fileBuffer, folder = 'bugtracker') => {
  return new Promise((resolve, reject) => {
    // MOCK UPLOAD FOR NOW
    setTimeout(() => {
      resolve({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        public_id: `mock_id_${Date.now()}`
      });
    }, 1000);

    /* Real implementation:
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
    */
  });
};
