const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Upload options
 */
const uploadImage = async (buffer, { folder = 'zyvo', publicId, transformation } = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      ...(publicId && { public_id: publicId }),
      resource_type: 'image',
      transformation: transformation || [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error:', error.message);
        reject(error);
      } else {
        resolve(result);
      }
    });

    uploadStream.end(buffer);
  });
};

/**
 * Upload avatar to Cloudinary
 */
const uploadAvatar = async (buffer, userId) => {
  const result = await uploadImage(buffer, {
    folder: 'zyvo/avatars',
    publicId: `avatar_${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
};

/**
 * Upload a space/venue image
 */
const uploadSpaceImage = async (buffer, studyHallId) => {
  const result = await uploadImage(buffer, {
    folder: `zyvo/spaces/${studyHallId}`,
    transformation: [
      { width: 1200, height: 800, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
};

/**
 * Delete an image from Cloudinary by URL or public ID
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error.message);
    throw error;
  }
};

/**
 * Extract Cloudinary public ID from a URL
 */
const extractPublicId = (url) => {
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
};

/**
 * Upload an event banner
 */
const uploadEventBanner = async (buffer, eventId) => {
  const result = await uploadImage(buffer, {
    folder: `zyvo/events/${eventId}`,
    transformation: [
      { width: 1600, height: 900, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
};

module.exports = {
  uploadImage,
  uploadAvatar,
  uploadSpaceImage,
  uploadEventBanner,
  deleteImage,
  extractPublicId,
};
