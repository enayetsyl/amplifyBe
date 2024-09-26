const bcrypt = require("bcryptjs");
const Contact = require("../models/contactModel");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");

// Controller to create a new project
const createContact = async (req, res) => {
  const { firstName, lastName, email, companyName, roles, createdBy } = req.body;

  // Validation to check if all required fields are present
  if (!firstName || !lastName || !email || !companyName || !roles || !createdBy) {
    return res.status(400).json({
      message: "All fields are required: firstName, lastName, email, companyName, roles, createdBy."
    });
  }

  try {
    const user = await User.findById(createdBy);
    if (!user || !user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email needs to be verified before creating a contact.',
      });
    }

    const newContact = new Contact({
      firstName, lastName, email, companyName, roles, createdBy
    });

    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all projects with pagination
const getAllContacts = async (req, res) => {

  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const contacts = await Contact.find()
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents
    const totalDocuments = await Contact.countDocuments(); // Total number of documents in collection
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages
    
    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      contacts,
    });
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a project by ID
const getContactById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a project
const updateContact = async (req, res) => {
  const { id } = req.params;
  const {
    firstName, lastName, email, companyName, roles
  } = req.body;

  try {

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        firstName, lastName, email, companyName, roles
      },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.log('error in update contact function', error)
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContactsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params)
    if (!id) {
      return res.status(400).json({ message: 'createdBy ID is required' });
    }

    const contacts = await Contact.find({createdBy:id });
    
    if (contacts.length === 0) {
      return res.status(404).json({ message: 'No contacts found for this user' });
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};


//search API
const searchContactsByFirstName = async (req, res) => {
  const { firstName } = req.query;  // Get the firstName from query parameters
  
  // Check if firstName query parameter is provided
  if (!firstName) {
    return res.status(400).json({
      message: "Please provide a firstName to search for."
    });
  }

  try {
    console.log(`Searching for contacts with firstName: ${firstName}`);
    
    // Search for contacts by matching the first name (case-insensitive)
    const contacts = await Contact.find({ firstName: { $regex: firstName, $options: 'i' } });
    
    // Log the number of contacts found
    console.log(`${contacts.length} contact(s) found for the search term: ${firstName}`);
    
    if (contacts.length === 0) {
      return res.status(404).json({
        message: `No contacts found with the first name: ${firstName}`
      });
    }
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error(`Error during search: ${error.message}`);
    res.status(500).json({
      message: "Server error while searching for contacts. Please try again later."
    });
  }
};


// DELETE route

module.exports = {
  
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactsByUserId,
  searchContactsByFirstName
};
