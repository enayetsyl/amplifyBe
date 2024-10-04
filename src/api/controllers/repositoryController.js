const Repository = require("../models/repositoryModel");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


const createRepository = async (req,res) => {
  let filePath = req.file ? req.file.path : null;
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
    const { meetingId, projectId, addedBy, role } = req.body;
   


    // Optional: Upload file to Cloudinary and get the URL
    let cloudinaryLink = '';
    try {
      const result = await cloudinary.uploader.upload(filePath, {
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
  }finally {
    // Delete the file from the server
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully:', filePath);
        }
      });
    }
  }
}

const getRepositoryByProjectId = async(req, res) => {
  try {
    const projectId = req.params.projectId;
    const repositories = await Repository.find({ projectId });
    console.log('repository', repositories);
    res.status(200).json({message: 'Repositories fetched successfully', repositories});
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repository by project ID', error: error.message });
    
  }
}
const renameFile = async (req, res) => {
  const { id } = req.params;
  const { fileName } = req.body;
  try {
    const updatedFile = await Repository.findByIdAndUpdate(
      id,
      { fileName: fileName },
      { new: true } 
    );
    if (!updatedFile) {
      res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File renamed successfully', updatedFile });
  } catch (error) {
    console.error('Error renaming file:', error);
   res.status(500).json({ message: 'Error renaming file', error: error.message });
  }
};
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFile = await Repository.findByIdAndDelete(id);

    if (!deletedFile) {
      res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File deleted successfully', deletedFile });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};



module.exports = {
  createRepository,
  getRepositoryByProjectId,
  renameFile,
  deleteFile,
};