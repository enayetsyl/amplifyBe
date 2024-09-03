const bcrypt = require("bcryptjs");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const Meeting = require("../models/meetingModel");

// Controller to create a new project
const createProject = async (req, res) => { 
  const session = await mongoose.startSession();

  try {
    // Extract formData from the request body
    session.startTransaction();
    const formData = req.body;
    console.log('form data', formData)
  
    // Step 1: Create the project
    const newProject = new Project({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      projectPasscode: formData.projectPasscode,
      createdBy: formData.createdBy,
      tags: formData.tags,
      members: formData.members,
    });

    const savedProject = await newProject.save({ session });

    // Step 2: Create the meetings associated with the project
    
    const newMeeting = new Meeting({
      projectId: savedProject._id,
      title: formData.meeting.title,
      description: formData.meeting.description,
      startDate: formData.meeting.startDate,
      startTime: formData.meeting.startTime,
      timeZone: formData.meeting.timeZone,
      duration: formData.meeting.duration,
      ongoing: formData.meeting.ongoing,
      enableBreakoutRoom: formData.meeting.enableBreakoutRoom,
      meetingPasscode: formData.meeting.meetingPasscode,
      moderator: formData.meeting.moderator,
    });

    await newMeeting.save({ session });
    
    // Commit the transaction
    
    await session.commitTransaction();
    session.endSession();
console.log(savedProject, newMeeting)
    res.status(201).json({
      message: 'Project and meeting created successfully',
      projectId: savedProject._id,
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Controller to get all projects with pagination
const getAllProjects = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page
  const { id } = req.params; // Get the user ID from the route parameters
console.log('get all projects id', id)
  try {
    // Find projects where createdBy matches the provided user ID or userId in the people array matches the user ID
    const projects = await Project.find({
      $or: [
        { createdBy: id },
        { 'members.userId': id }
      ]
    })
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents

    const totalDocuments = await Project.countDocuments({
      $or: [
        { createdBy: id },
        { 'members.userId': id }
      ]
    }); // Total number of documents matching the criteria
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a project
const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    startDate,
    status,
    startTime,
    timeZone,
    participants,
    observers,
    breakoutRooms,
    polls,
    interpreters,
    passcode,
    endDate,
  } = req.body;

  try {
    // Hash the passcode using bcryptjs if provided
    let hashedPasscode = passcode;
    if (passcode) {
      hashedPasscode = await bcrypt.hash(passcode, 8); // Adjust saltRounds as per your security requirements
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        startDate,
        status,
        startTime,
        timeZone,
        participants: participants || [],
        observers: observers || [],
        breakoutRooms: breakoutRooms || [],
        polls: polls || [],
        interpreters: interpreters || [],
        passcode: hashedPasscode,
        endDate,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  console.log("f", req);
  const { id } = req.params; // Extract ID from request parameters
  try {
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE route

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};


// const newProject = new Project({
//   projectName: formData.projectName,
//   projectDescription: formData.projectDescription,
//   endDate: formData.endDate,
//   projectPasscode: formData.projectPasscode,
//   createdBy: formData.createdBy,
//   people: formData.people,
//   meetingTitle: formData.meetingTitle,
//   meetingModerator: formData.meetingModerator,
//   meetingDescription: formData.meetingDescription,
//   startDate: formData.startDate,
//   startTime: formData.startTime,
//   timeZone: formData.timeZone,
//   duration: formData.duration,
//   ongoing: formData.ongoing,
//   enableBreakoutRoom: formData.enableBreakoutRoom,
//   meetingPasscode: formData.meetingPasscode,
//   status: 'Draft', 
//   tags: formData.tags || [], 
//   // role: formData.role || [] 
// });

// // Save the project to the database
// await newProject.save();

// // Send a success response back to the frontend
// res.status(201).json({
//   message: 'Project created successfully',
//   project: newProject
// });