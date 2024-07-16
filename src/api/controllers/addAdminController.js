const AddAdmin = require("../models/addAdminModel"); // Adjust the path as necessary
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Controller function to handle create request
const createAdmin = async (req, res) => {
  const { firstName, lastName, email, company, password, confirmPassword } =
    req.body;

  // Validate input data
  if (
    !firstName ||
    !lastName ||
    !email ||
    !company ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).send("All fields are required.");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new AddAdmin({
      firstName,
      lastName,
      email,
      company,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).send("Admin created successfully.");
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).send("Error creating admin.");
  }
};

// Controller function to handle update request
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, company, password, confirmPassword } =
    req.body;

  // Validate input data
  if (!firstName || !lastName || !email || !company) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const updateData = { firstName, lastName, email, company };

    if (password && confirmPassword && password === confirmPassword) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
      updateData.confirmPassword = hashedPassword;
    }

    const updatedAdmin = await AddAdmin.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAdmin) {
      return res.status(404).send("Admin not found.");
    }

    res.status(200).send("Admin updated successfully.");
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).send("Error updating admin.");
  }
};

// Controller function to handle delete request
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAdmin = await AddAdmin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).send("Admin not found.");
    }

    res.status(200).send("Admin deleted successfully.");
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).send("Error deleting admin.");
  }
};

// Controller function to handle get request
const getAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await AddAdmin.findById(id);

    if (!admin) {
      return res.status(404).send("Admin not found.");
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error retrieving admin:", error);
    res.status(500).send("Error retrieving admin.");
  }
};

// Controller function to handle get all request
const getAllAdmins = async (req, res) => {
  try {
    const admins = await AddAdmin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error retrieving admins:", error);
    res.status(500).send("Error retrieving admins.");
  }
};

module.exports = {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmin,
  getAllAdmins,
};
