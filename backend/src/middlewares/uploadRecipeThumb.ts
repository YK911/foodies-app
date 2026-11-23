import createHttpError from 'http-errors';
import multer from 'multer';

const MAX_RECIPE_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(createHttpError(400, 'Only image files are allowed'));
    return;
  }

  callback(null, true);
};

export const uploadRecipeThumb = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_RECIPE_IMAGE_SIZE,
  },
}).single('thumb');
