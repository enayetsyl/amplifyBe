const Poll = require("../models/poll.model");
const Project = require("../models/project.model");
const { validationResult } = require("express-validator");

// Controller to create a new poll
const createPoll = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { project, pollName, isActive, question, options, choice } = req.body;

  try {
    // Check if the project exists
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create a new poll instance
    const newPoll = new Poll({
      project,
      pollName,
      isActive,
      question,
      options,
      choice,
    });

    // Save the poll to the database
    const savedPoll = await newPoll.save();

    res.status(201).json(savedPoll); // Respond with the saved poll
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all polls
const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find();
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a poll by ID
const getPollById = async (req, res) => {
  const { id } = req.params;
  try {
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a poll
const updatePoll = async (req, res) => {
  const { id } = req.params;
  const { pollName, isActive, question, options, choice } = req.body;

  try {
    const updatedPoll = await Poll.findByIdAndUpdate(
      id,
      {
        pollName,
        isActive,
        question,
        options,
        choice,
      },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete a poll
const deletePoll = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPoll = await Poll.findByIdAndDelete(id);
    if (!deletedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
};
