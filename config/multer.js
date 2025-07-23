const multer = require('multer');

// Define allowed MIME types
const allowedMimeTypes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// Configure Multer storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only PDF and Word documents are allowed!'), false); // Reject file
  }
};

// Create Multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
