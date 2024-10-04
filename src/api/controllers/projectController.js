const bcrypt = require("bcryptjs");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Meeting = require("../models/meetingModel");
const User = require("../models/userModel");

// Controller to create a new project
const createProject = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Extract formData from the request body
    session.startTransaction();
    const formData = req.body;

    // Step 0: Check if the user who is creating the project has a verified email
    const user = await User.findById(formData.createdBy);
    if (!user || !user.isEmailVerified) {
      res.status(400).json({
        message: "Email needs to be verified before creating a project.",
      });
      return;
    }

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
      status: formData.status,
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
    res.status(201).json({
      message: "Project and meeting created successfully",
      projectId: savedProject._id,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Controller to get all projects with pagination
const getAllProjects = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page
  const { id } = req.params; // Get the user ID from the route parameters
  try {
    // Find projects where createdBy matches the provided user ID or userId in the people array matches the user ID
    const userData = await User.findById(id);
    const userEmail = userData.email;

    const projects = await Project.find({
      $or: [{ createdBy: id }, { "members.email": userEmail }],
    })
    .populate('members.userId', 'firstName lastName addedDate lastUpdatedOn')
      .skip((page - 1) * limit) 
      .limit(parseInt(limit)); 

    const totalDocuments = await Project.countDocuments({
      $or: [{ createdBy: id }, { "members.email": userEmail }],
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
    const project = await Project.findById(id).populate('members.userId', 'firstName lastName addedDate lastUpdatedOn');
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
// DELETE route
const deleteProject = async (req, res) => {
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
//search API

const searchProjectsByFirstName = async (req, res) => {
  const { name } = req.query; // Get the firstName from query parameters

  // Check if firstName query parameter is provided
  if (!name) {
    return res.status(400).json({
      message: "Please provide a firstName to search for.",
    });
  }

  try {

    // Search for Projects by matching the first name (case-insensitive)
    const Projects = await Project.find({
      name: { $regex: name, $options: "i" },
    });

   

    if (Projects.length === 0) {
      return res.status(404).json({
        message: `No Projects found with the first name: ${name}`,
      });
    }

    res.status(200).json(Projects);
  } catch (error) {
    console.error(`Error during search: ${error.message}`);
    res.status(500).json({
      message:
        "Server error while searching for Projects. Please try again later.",
    });
  }
};

const projectStatusChange = async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  // Validate status to ensure it's one of the allowed values
  const validStatuses = ['Draft', 'Active', 'Complete', 'Inactive', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Status must be one of 'Draft', 'Active', 'Complete', 'Inactive', or 'Closed'.",
    });
  }

  try {
// Find the project by ID and update the status
const updatedProject = await Project.findByIdAndUpdate(
  projectId,
  { status, updatedAt: Date.now() },
  { new: true } // Return the updated document
);
if (!updatedProject) {
  return res.status(404).json({ message: 'Project not found' });
}
// test
res.status(200).json({
  message: 'Project status updated successfully',
  project: updatedProject,
});
} catch (error) {
console.error('Error updating project status:', error);
res.status(500).json({
  message: 'Failed to update project status',
  error: error.message,
});
}
};
// Edit project general info

const updateGeneralProjectInfo = async (req, res) => {
  const { projectId } = req.params; 
  const { name, description, startDate, endDate, projectPasscode } = req.body; 
  try {
    // Validate the input
    if (!name || !startDate || !projectPasscode) {
      return res.status(400).json({ message: 'Name, Start Date, and Project Passcode are required.' });
    }
    // Find the project by its ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    // Update project fields with the new values
    project.name = name;
    project.description = description || project.description;
    project.startDate = startDate;
    project.endDate = endDate || project.endDate;
    project.projectPasscode = projectPasscode;
    // Save the updated project
    await project.save();
    return res.status(200).json({ message: 'Project updated successfully.', project });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Server error. Could not update the project.' });
  }
};

const addPeopleIntoProject = async (req, res) => {
  const { projectId, people } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    people.forEach((person) => {
      project.members.push({
        userId: person.personId,
        roles: person.roles,
        email: person.email,
      });
    });
    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id).populate('members.userId');

    res.status(200).json({ message: 'People added successfully', updatedProject: populatedProject  });
  } catch (error) {
    res.status(500).json({ message: 'Error adding people', error });
  }
}


const editMemberRole = async(req, res) => {
  try {
    const { projectId } = req.params;
    const { updatedMember } = req.body;
   
    // Find the project by ID and update the specific member's roles
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, 'members._id': updatedMember._id }, 
      {
        $set: { 'members.$.roles': updatedMember.roles } 
      },
      { new: true } 
    );

 
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project or member not found' });
    }
    const populatedProject = await Project.findById(projectId).populate('members.userId');
    return res.status(200).json({
      message: 'Member roles updated successfully',
      updatedProject: populatedProject,
    });
  } catch (error) {
    console.error('Error updating member roles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const deleteMemberFromProject = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
   
    // Find the project and remove the member from the members array
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId }, 
      { $pull: { members: { _id: memberId } } },
      { new: true } 
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project or member not found' });
    }
    const populatedProject = await Project.findById(projectId).populate('members.userId');
    return res.status(200).json({
      message: 'Member removed successfully',
      updatedProject: populatedProject,
    });
  } catch (error) {
    console.error('Error removing member from project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBulkMembers = async (req,res) => {
  try {
    const { projectId, members } = req.body;

    const updatedProject = await Project.updateOne(
      { _id: projectId },
      { $set: {members: members} }, 
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const populatedProject = await Project.findById(projectId).populate('members.userId');

    return res.status(200).json({ message: 'Members updated successfully',  updatedProject: populatedProject });
  } catch (error) {
    console.error('Error updating bulk members:', error);
    return res.status(500).json({ message: 'Internal server error' });
    
  }
}









module.exports = {
  searchProjectsByFirstName,
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  projectStatusChange,
  updateGeneralProjectInfo,
  addPeopleIntoProject,
  editMemberRole,
  deleteMemberFromProject,
  updateBulkMembers
};

