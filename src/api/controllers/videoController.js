const MeetingRecording = require("../models/videoModel"); // Adjust the path as necessary
const Project = require("../models/projectModel"); // Adjust the path as necessary
const SendLink = require("../models/meetingLinkModel"); // Adjust the path as necessary
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filePath =
      file.fieldname === "video" ? "uploads/videos/" : "uploads/transcripts/";
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const videoFileTypes = /mp4|mkv|avi|mov/;
    const pdfFileTypes = /pdf/;
    const mimetype =
      videoFileTypes.test(file.mimetype) || pdfFileTypes.test(file.mimetype);
    const extname =
      videoFileTypes.test(path.extname(file.originalname).toLowerCase()) ||
      pdfFileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only video and PDF files are allowed!"));
    }
  },
}).fields([
  { name: "video", maxCount: 10 },
  { name: "transcript", maxCount: 1 },
]); // Allow multiple video files and one PDF file

// Controller function to handle create request with video and PDF upload
const createMeetingRecording = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const { project, meeting } = req.body;
    const videoFiles = req.files["video"]
      ? req.files["video"].map((file) => file.path)
      : [];
    const transcriptFiles = req.files["transcript"]
      ? req.files["transcript"].map((file) => file.path)
      : [];

    // Validate input data
    if (
      !project ||
      !meeting ||
      videoFiles.length === 0 ||
      transcriptFiles.length === 0
    ) {
      return res
        .status(400)
        .send(
          "Project, meeting, at least one video, and a PDF file are required."
        );
    }

    try {
      const projectDoc = await Project.findById(project);
      const meetingDoc = await SendLink.findById(meeting);

      if (!projectDoc) {
        return res.status(404).send("Project not found.");
      }
      if (!meetingDoc) {
        return res.status(404).send("Meeting not found.");
      }

      const newMeetingRecording = new MeetingRecording({
        project,
        meeting,
        video: videoFiles,
        transcript: transcriptFiles,
      });

      await newMeetingRecording.save();
      res.status(201).send("Meeting recording created successfully.");
    } catch (error) {
      console.error("Error creating meeting recording:", error);
      res.status(500).send("Error creating meeting recording.");
    }
  });
};

// Controller function to handle update request with video and PDF upload
const updateMeetingRecording = async (req, res) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const { project, meeting } = req.body;
    const videoFiles = req.files["video"]
      ? req.files["video"].map((file) => file.path)
      : [];
    const transcriptFiles = req.files["transcript"]
      ? req.files["transcript"].map((file) => file.path)
      : [];

    // Validate input data
    if (
      !project ||
      !meeting ||
      videoFiles.length === 0 ||
      transcriptFiles.length === 0
    ) {
      return res
        .status(400)
        .send(
          "Project, meeting, at least one video, and a PDF file are required."
        );
    }

    try {
      const projectDoc = await Project.findById(project);
      const meetingDoc = await SendLink.findById(meeting);

      if (!projectDoc) {
        return res.status(404).send("Project not found.");
      }
      if (!meetingDoc) {
        return res.status(404).send("Meeting not found.");
      }

      const updateData = {
        project,
        meeting,
        video: videoFiles,
        transcript: transcriptFiles,
      };

      const updatedMeetingRecording = await MeetingRecording.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedMeetingRecording) {
        return res.status(404).send("Meeting recording not found.");
      }

      res.status(200).send("Meeting recording updated successfully.");
    } catch (error) {
      console.error("Error updating meeting recording:", error);
      res.status(500).send("Error updating meeting recording.");
    }
  });
};

// Controller function to handle delete request
const deleteMeetingRecording = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMeetingRecording = await MeetingRecording.findByIdAndDelete(
      id
    );

    if (!deletedMeetingRecording) {
      return res.status(404).send("Meeting recording not found.");
    }

    res.status(200).send("Meeting recording deleted successfully.");
  } catch (error) {
    console.error("Error deleting meeting recording:", error);
    res.status(500).send("Error deleting meeting recording.");
  }
};

// Controller function to handle get request
const getMeetingRecording = async (req, res) => {
  const { id } = req.params;

  try {
    const meetingRecording = await MeetingRecording.findById(id)
      .populate("project")
      .populate("meeting");

    if (!meetingRecording) {
      return res.status(404).send("Meeting recording not found.");
    }

    res.status(200).json(meetingRecording);
  } catch (error) {
    console.error("Error retrieving meeting recording:", error);
    res.status(500).send("Error retrieving meeting recording.");
  }
};

// Controller function to handle get all request with pagination
const getAllMeetingRecordings = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const meetingRecordings = await MeetingRecording.find()
      .populate("project")
      .populate("meeting")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await MeetingRecording.countDocuments();

    res.status(200).json({
      meetingRecordings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving meeting recordings:", error);
    res.status(500).send("Error retrieving meeting recordings.");
  }
};

module.exports = {
  createMeetingRecording,
  updateMeetingRecording,
  deleteMeetingRecording,
  getMeetingRecording,
  getAllMeetingRecordings,
  upload, // Export multer upload for use in routes
};
