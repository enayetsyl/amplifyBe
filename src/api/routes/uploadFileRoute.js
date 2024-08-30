const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/uploadFileController');

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // This should match the directory where you are storing files
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  

const upload = multer({ storage: storage });

// POST - Upload File
router.post('/upload', upload.single('file'), fileController.uploadFile);

// GET - List All Files
router.get('/files', fileController.getFiles);

// DELETE - Delete a File
router.delete('/files/:id', fileController.deleteFile);

module.exports = router;
