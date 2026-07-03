const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ── Local disk storage (temp before Cloudinary upload) ─────────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ── Memory storage (for direct Cloudinary stream upload) ───────────────────
const memoryStorage = multer.memoryStorage();

// ── File filter: images only ───────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

// ── Upload configurations ──────────────────────────────────────────────────

/** Single avatar upload (max 2MB) */
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

/** Multiple space images (max 10 files, 5MB each) */
const uploadSpaceImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file
}).array('images', 10);

/** Single cover image */
const uploadCoverImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('coverImage');

module.exports = { uploadAvatar, uploadSpaceImages, uploadCoverImage };
