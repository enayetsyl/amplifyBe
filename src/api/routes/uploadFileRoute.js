const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/uploadFileController');
const fs = require('fs');
const path = require('path');


// Set up multer for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/'); // This should match the directory where you are storing files
//     },
//     filename: function (req, file, cb) {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   });
  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads'); // Adjust the path as needed
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
    cb(null, uploadPath); // This should match the directory where you are storing files
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}-${Date.now()}-`);
  },
});


const upload = multer({ storage: storage });

// POST - Upload File
router.post('/upload', upload.single('file'), fileController.uploadFile);

// GET - List All Files
router.get('/files', (req, res, next) => {
  console.log("GET /api/files route hit");
  next();
}, fileController.getFiles);


// DELETE - Delete a File
router.delete('/files/:id', fileController.deleteFile);

module.exports = router;
