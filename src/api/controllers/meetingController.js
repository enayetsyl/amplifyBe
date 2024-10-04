const Project = require("../models/projectModel");
const Meeting = require("../models/meetingModel");
const Contact = require("../models/contactModel");

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



const getAllMeetings = async (req, res) => {
  try {
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all meetings that match the projectId with pagination
    const meetings = await Meeting.find({ projectId: req.params.projectId })
    .populate('moderator')
      .skip(skip)
      .limit(limit);
      
   
    // Count total documents matching the projectId
    const totalDocuments = await Meeting.countDocuments({ projectId: req.params.projectId  });

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

//Verify moderator meeting passcode
const verifyModeratorMeetingPasscode = async (req, res) => {
  const { meetingId, passcode } = req.body;

  try {
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.meetingPasscode === passcode) {
      return res.status(200).json({ message: "Passcode is correct" });
    } else {
      return res.status(401).json({ message: "Invalid passcode" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const getMeetingById = async(req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meeting.findById(meetingId).populate('moderator');
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.status(200).json({message: "Meeting found", meetingDetails: meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
}


module.exports = {
  createMeeting,
  getAllMeetings, verifyModeratorMeetingPasscode,
  getMeetingById

};
