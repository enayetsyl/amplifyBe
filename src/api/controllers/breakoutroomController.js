const BreakoutRoom = require("../models/breakoutroomModel"); // Adjust the path as necessary
const Project = require("../models/projectModel"); // Adjust the path as necessary

// Controller function to handle create request
const createBreakoutRoom = async (req, res) => {
console.log("braeck")
  const { project, name, participants, duration, interpretor } = req.body;
  // Validate input data
  if (!project || !name || !duration) {
    return res.status(400).send("Project, name, and duration are required.");
  }
  console.log("H")
  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const newBreakoutRoom = new BreakoutRoom({
      project,
      name,
      participants,
      duration,
      interpretor,
    });

    await newBreakoutRoom.save();
    res.status(201).send("Breakout room created successfully.");
  } catch (error) {
    console.error("Error creating breakout room:", error);
    res.status(500).send("Error creating breakout room.");
  }
};

// Controller function to handle update request
const updateBreakoutRoom = async (req, res) => {
  console.log("1")
  const { id } = req.params;
  const { project, name, participants, duration, interpretor } = req.body;

  // Validate input data
  if (!project || !name || !duration) {
    return res.status(400).send("Project, name, and duration are required.");
  }

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const updateData = { project, name, participants, duration, interpretor };
    const updatedBreakoutRoom = await BreakoutRoom.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedBreakoutRoom) {
      return res.status(404).send("Breakout room not found.");
    }

    res.status(200).send("Breakout room updated successfully.");
  } catch (error) {
    console.error("Error updating breakout room:", error);
    res.status(500).send("Error updating breakout room.");
  }
};

// Controller function to handle delete request
const deleteBreakoutRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBreakoutRoom = await BreakoutRoom.findByIdAndDelete(id);

    if (!deletedBreakoutRoom) {
      return res.status(404).send("Breakout room not found.");
    }

    res.status(200).send("Breakout room deleted successfully.");
  } catch (error) {
    console.error("Error deleting breakout room:", error);
    res.status(500).send("Error deleting breakout room.");
  }
};

// Controller function to handle get request
const getBreakoutRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const breakoutRoom = await BreakoutRoom.findById(id)
      .populate("project")
      .populate("participants");

    if (!breakoutRoom) {
      return res.status(404).send("Breakout room not found.");
    }

    res.status(200).json(breakoutRoom);
  } catch (error) {
    console.error("Error retrieving breakout room:", error);
    res.status(500).send("Error retrieving breakout room.");
  }
};

// Controller function to handle get all request
const getAllBreakoutRooms = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const breakoutRooms = await BreakoutRoom.find()
      .populate("project")
      .populate("participants")
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents

    const totalDocuments = await BreakoutRoom.countDocuments(); // Total number of documents in collection
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      breakoutRooms,
    });
  } catch (error) {
    console.error("Error retrieving breakout rooms:", error);
    res.status(500).send("Error retrieving breakout rooms.");
  }
};

module.exports = {
  createBreakoutRoom,
  updateBreakoutRoom,
  deleteBreakoutRoom,
  getBreakoutRoom,
  getAllBreakoutRooms,
};
