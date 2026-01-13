// Import cloudinary package - USE .v2 for latest version
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/**
 * Configure Cloudinary with credentials from .env
 * Sign up at cloudinary.com to get these credentials for free
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
/**
 * Configure Multer to use Cloudinary storage
 * Images are uploaded directly to Cloudinary when received
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'novara-jewels',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

/**
 * File filter - validates file types before upload
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

/**
 * Initialize multer with Cloudinary storage
 */
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

/**
 * Helper function to delete image from Cloudinary
 * @param {String} imageUrl - Full Cloudinary URL
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = `novara-jewels/${fileWithExtension.split('.')[0]}`;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export { cloudinary, upload, deleteFromCloudinary };