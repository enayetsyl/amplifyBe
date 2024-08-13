const Company = require("../models/companyModel"); // Adjust the path as necessary

// Create a new company
const createCompany = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send("Name and description are required.");
  }

  try {
    const newCompany = new Company({ name, description });
    await newCompany.save();
    res.status(201).send("Company created successfully.");
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).send("Error creating company.");
  }
};

// Update a company
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send("Name and description are required.");
  }

  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedCompany) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).send("Company updated successfully.");
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).send("Error updating company.");
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).send("Company deleted successfully.");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company.");
  }
};

// Get a single company
const getCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company:", error);
    res.status(500).send("Error retrieving company.");
  }
};

// Get all companies with pagination
const getAllCompanies = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const companies = await Company.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Company.countDocuments();

    res.status(200).json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Error retrieving companies.");
  }
};

module.exports = {
  createCompany,
  updateCompany,
  deleteCompany,
  getCompany,
  getAllCompanies,
};
