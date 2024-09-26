const UserRole = require("../models/userMeetJoinModal");

// Controller to create a new user role
const createUserRole = async (req, res) => {
    console.log("triggers")
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: "Name and Role are required" });
  }

  let newUserRole;

  // Define logic based on the role
  if (role === "Moderator") {
    newUserRole = {
      name,
      role,
      CanScreenshare: true,
      CanManagerMuteForAll: true,
      CanManagerCameraForAll: true,
      ShowToAll: true,
      CanTalk: true,
    };
  } else if (role === "Participant") {
    newUserRole = {
      name,
      role,
      CanScreenshare: true,
      CanManagerMuteForAll: false,
      CanManagerCameraForAll: false,
      ShowToAll: true,
      CanTalk: true,
    };
  } else if (role === "Observer") {
    newUserRole = {
      name,
      role,
      CanScreenshare: false,
      CanManagerMuteForAll: false,
      CanManagerCameraForAll: false,
      ShowToAll: false,
      CanTalk: false,
    };
  } else {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const userRole = new UserRole(newUserRole);
    await userRole.save();
    return res.status(201).json(userRole);
  } catch (error) {
    return res.status(500).json({ message: "Error creating user role", error });
  }
};

// Controller to get user role by ID
const getUserRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const userRole = await UserRole.findById(id);
    if (!userRole) {
      return res.status(404).json({ message: "User role not found" });
    }
    return res.status(200).json(userRole);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving user role", error });
  }
};

module.exports = { createUserRole, getUserRoleById };
