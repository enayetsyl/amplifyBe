// controllers/meetingController.js
const Meeting = require("../models/meetUserModal");

// Helper function to create a slug from userName and roomName
const createSlug = (userName, roomName) => {
  const sanitizeduserName = userName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const sanitizedRoomName = roomName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  return `${sanitizeduserName}-${sanitizedRoomName}`;
};

// Add a new participant to a room
exports.addParticipant = async (req, res) => {
  const { roomName, userName } = req.body;

  try {
    // Check if the userName already exists in the room
    const existingParticipant = await Meeting.findOne({ roomName, userName });
    if (existingParticipant) {
      return res
        .status(400)
        .json({ message: "userName is already in use for this room" });
    }

    // Create a new meeting participant
    const newParticipant = new Meeting({ roomName, userName });
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
  const { roomName, userName } = req.body;

  try {
    // Find and delete the participant based on roomName and userName
    const deletedParticipant = await Meeting.findOneAndDelete({
      roomName,
      userName,
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
    // Extract userName and roomName from the slug
    const [userName, roomName] = slug
      .split("-")
      .map((part) => part.replace(/-/g, " "));

    // Find the user in the database based on userName and roomName
    const user = await Meeting.findOne({ roomName, userName });

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
