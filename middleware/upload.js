const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'book') {
      cb(null, 'uploads/books/');
    } else if (file.fieldname === 'cover') {
      cb(null, 'uploads/covers/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    book: ['.pdf', '.epub', '.mobi', '.txt', '.docx', '.doc', '.fb2', '.rtf'],
    cover: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = allowedTypes[file.fieldname] || [];

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Single book upload
const uploadBook = upload.single('book');

// Single cover upload
const uploadCover = upload.single('cover');

// Multiple files upload
const uploadBookAndCover = upload.fields([
  { name: 'book', maxCount: 1 },
  { name: 'cover', maxCount: 5 }
]);

module.exports = { uploadBook, uploadCover, uploadBookAndCover };
