const bcrypt = require("bcryptjs");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");

// Controller to create a new project
const createProject = async (req, res) => {
  const {
    name,
    description,
    startDate,
    status,
    creator,
    moderator,
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

  console.log(req.body); // Log the request body to the console

  try {
    let hashedPasscode = passcode;
    if (passcode) {
      hashedPasscode = await bcrypt.hash(passcode, 8);
    }

    const newProject = new Project({
      name,
      description,
      startDate,
      status,
      creator,
      moderator,
      startTime,
      timeZone,
      participants: participants || [],
      observers: observers || [],
      breakoutRooms: breakoutRooms || [],
      polls: polls || [],
      interpreters: interpreters || [],
      passcode: hashedPasscode,
      endDate,
    });

    console.log("saved", newProject);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all projects with pagination
const getAllProjects = async (req, res) => {
  
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const projects = await Project.find()
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents

    const totalDocuments = await Project.countDocuments(); // Total number of documents in collection
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
