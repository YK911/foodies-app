import { v2 as cloudinary } from 'cloudinary';
import createHttpError from 'http-errors';

const ensureCloudinaryConfigured = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw createHttpError(500, 'Cloudinary credentials are not configured in .env');
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
};

export const uploadImageBuffer = (buffer: Buffer, folder: string): Promise<string> => {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(
            createHttpError(
              502,
              error?.message
                ? `Cloudinary upload failed: ${error.message}`
                : 'Failed to upload image to Cloudinary',
            ),
          );
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
