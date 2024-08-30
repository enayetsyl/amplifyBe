// controllers/meetingController.js
const Meeting = require("../models/meetUserModal");

// Helper function to create a slug from email and roomName
const createSlug = (email, roomName) => {
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const sanitizedRoomName = roomName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  return `${sanitizedEmail}-${sanitizedRoomName}`;
};

// Add a new participant to a room
exports.addParticipant = async (req, res) => {
  const { roomName, email } = req.body;

  try {
    // Check if the email already exists in the room
    const existingParticipant = await Meeting.findOne({ roomName, email });
    if (existingParticipant) {
      return res
        .status(400)
        .json({ message: "Email is already in use for this room" });
    }

    // Create a new meeting participant
    const newParticipant = new Meeting({ roomName, email });
    await newParticipant.save();

    res.status(201).json({
      message: "Participant added successfully",
      data: newParticipant,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding participant", error: error.message });
  }
};

// Remove a participant from a room
exports.removeParticipant = async (req, res) => {
  const { roomName, email } = req.body;

  try {
    // Find and delete the participant based on roomName and email
    const deletedParticipant = await Meeting.findOneAndDelete({
      roomName,
      email,
    });

    if (!deletedParticipant) {
      return res
        .status(404)
        .json({ message: "Participant not found in this room" });
    }

    // Return the details of the removed participant
    res.status(200).json({
      message: "Participant removed successfully",
      data: deletedParticipant,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing participant", error: error.message });
  }
};

// Get user details by slug
exports.getUserDetailsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // Extract email and roomName from the slug
    const [email, roomName] = slug
      .split("-")
      .map((part) => part.replace(/-/g, " "));

    // Find the user in the database based on email and roomName
    const user = await Meeting.findOne({ roomName, email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user details", error: error.message });
  }
};
