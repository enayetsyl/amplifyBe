const bcrypt = require("bcryptjs");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const Meeting = require("../models/meetingModel");

// Controller to create a new project
const createMeeting = async (req, res) => {
  const meetingData = req.body;
  try {
    // Create and save the new meeting
    const newMeeting = new Meeting(meetingData);
    const savedMeeting = await newMeeting.save();
    // Send a success response with the saved meeting details
    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: savedMeeting,
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      message: 'Failed to create meeting',
      error: error.message,
    });
  }
};

// Adjust the path according to your project structure
const getAllMeetings = async (req, res) => {
  try {
    // Extract projectId from the request parameters
    const { projectId } = req.params;

    // Extract pagination parameters from the query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all meetings that match the projectId with pagination
    const meetings = await Meeting.find({ projectId })
      .populate('moderator', 'firstName lastName email')
      .skip(skip)
      .limit(limit);

    // Count total documents matching the projectId
    const totalDocuments = await Meeting.countDocuments({ projectId });

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // If no meetings are found, return a 404 error
    if (!meetings || meetings.length === 0) {
      return res.status(404).json({
        message: 'No meetings found for this project',
      });
    }



    // Return the matched meetings with pagination info
    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      meetings
    });
  } catch (error) {
    console.error('Error retrieving meetings:', error);
    res.status(500).json({
      message: 'Failed to retrieve meetings',
      error: error.message,
    });
  }
};

// DELETE route

module.exports = {
  createMeeting,
  getAllMeetings,
  // getMeetingById,
  // updateMeeting,
  // deleteMeeting,
};
