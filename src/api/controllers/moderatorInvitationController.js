const Moderator = require("../models/moderatorInvitatinModel"); // Adjust the path as necessary
const Project = require("../models/projectModel"); // Adjust the path as necessary
const nodemailer = require("nodemailer");

// Function to send email
const sendEmail = async (email) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "test356sales@gmail.com",
      pass: "ajjvnbfwmbrwbibg",
    },
  });

  let mailOptions = {
    from: "test356sales@gmail.com",
    to: email,
    subject: "Welcome to Amplify Research!",
    text: `Hi ${email},
        
Welcome to Amplify Research! You have been invited to become a system moderator by the admin. Click this link to sign up for an account and join the system.

Thank you,
The Amplify Research team.`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};

// Controller function to handle create request
const createModerator = async (req, res) => {
  console.log("calling")
  const { firstName, lastName, email, project } = req.body;

  // Validate input data
  if (!firstName || !lastName || !email || !project) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const newModerator = new Moderator({
      firstName,
      lastName,
      email,
      project,
    });

    await newModerator.save();
    await sendEmail(email);
    res.status(201).send("Moderator created and email sent successfully.");
  } catch (error) {
    console.error("Error creating moderator:", error);
    res.status(500).send("Error creating moderator.");
  }
};

// Controller function to handle update request
const updateModerator = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, project } = req.body;

  // Validate input data
  if (!firstName || !lastName || !email || !project) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const updateData = { firstName, lastName, email, project };
    const updatedModerator = await Moderator.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedModerator) {
      return res.status(404).send("Moderator not found.");
    }

    await sendEmail(email); // Assuming sendEmail is a function to send an email notification
    res.status(200).send("Moderator updated and email sent successfully.");
  } catch (error) {
    console.error("Error updating moderator:", error);
    res.status(500).send("Error updating moderator.");
  }
};

module.exports = { updateModerator };


// Controller function to handle delete request
const deleteModerator = async (req, res) => {
  console.log("hi")
  const  id  = req.query.id;
console.log(id)
  try {
    const deletedModerator = await Moderator.findByIdAndDelete(id);

    if (!deletedModerator) {
      return res.status(404).send("Moderator not found.");
    }

    res.status(200).send("Moderator deleted successfully.");
  } catch (error) {
    console.error("Error deleting moderator:", error);
    res.status(500).send("Error deleting moderator.");
  }
};

// Controller function to handle get request
const getModerator = async (req, res) => {
  const { id } = req.params;

  try {
    const moderator = await Moderator.findById(id).populate("project");

    if (!moderator) {
      return res.status(404).send("Moderator not found.");
    }

    res.status(200).json(moderator);
  } catch (error) {
    console.error("Error retrieving moderator:", error);
    res.status(500).send("Error retrieving moderator.");
  }
};

// Controller function to handle get all request with pagination
const getAllModerators = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const moderators = await Moderator.find()
      .populate("project")
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents

    const totalDocuments = await Moderator.countDocuments(); // Total number of documents in collection
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      moderators,
    });
  } catch (error) {
    console.error("Error retrieving moderators:", error);
    res.status(500).send("Error retrieving moderators.");
  }
};

module.exports = {
  createModerator,
  updateModerator,
  deleteModerator,
  getModerator,
  getAllModerators,
};
