const Repository = require("../models/repositoryModel");
const Meeting = require("../models/meetingModel");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


const createRepository = async (req,res) => {
  try {
    // Log req.body and req.file for debugging
    console.log('req.body', req.body);
    console.log('req.file', req.file); 

    // Check if file and meeting ID are provided
    if (!req.file || !req.body.meetingId) {
      return res.status(400).json({ error: 'File and meeting ID are required.' });
    }

    // Extract information from request
    const { originalname: fileName, mimetype: type, size } = req.file;
    const { meetingId, projectId } = req.body;
    const addedBy = `${req.body.firstName} ${req.body.lastName}`;
    const role = req.body.role;

    // Optional: Upload file to Cloudinary and get the URL
    let cloudinaryLink = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto', // Automatically determine file type (image, video, etc.)
        folder: 'repository_files', // Cloudinary folder for uploads
      });
      cloudinaryLink = result.secure_url;
      console.log('cloudinaryLink', cloudinaryLink);
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file to Cloudinary.' });
    }

    // Create a new repository document
    const repository = new Repository({
      fileName,
      type,
      size,
      addedBy,
      role,
      meetingId,
      projectId,
      cloudinaryLink, 
    });

    // Save the repository document to MongoDB
    await repository.save();

    // Return success response
    return res.status(201).json({ message: 'File uploaded successfully.', repository });
  } catch (error) {
    console.error('Error in createRepository:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

const getRepositoryByMeetingId = () => {
  
}
const renameFile = () => {
  
}
const deleteFile = () => {
  
}


module.exports = {
  createRepository,
  getRepositoryByMeetingId,
  renameFile,
  deleteFile,
};