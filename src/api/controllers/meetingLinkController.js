const MeetingLink = require("../models/meetingLinkModel"); // Adjust the path as necessary
const Project = require("../models/projectModel"); // Adjust the path as necessary
const nodemailer = require("nodemailer");

// Function to send meeting link email
const sendMeetingLink = async (email, meetingLink, projectName) => {
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
    subject: "Your Meeting Link",
    text: `Hello,

Here is your meeting link for the project "${projectName}": ${meetingLink}

Best regards,
Your Company Name`,
    html: `<p>Hello,</p><p>Here is your meeting link for the project "<strong>${projectName}</strong>": <a href="${meetingLink}">${meetingLink}</a></p><p>Best regards,<br>Your Company Name</p>`,
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
const createMeetingLink = async (req, res) => {
  const { name, email, project, meetingLink } = req.body;

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const newMeetingLink = new MeetingLink({
      name,
      email,
      project,
    });

    await newMeetingLink.save();
    await sendMeetingLink(email, meetingLink, projectDoc.name);
    res.status(200).send("Meeting link sent and saved successfully.");
  } catch (error) {
    console.error("Error creating meeting link:", error);
    res.status(500).send("Error creating meeting link.");
  }
};

// Controller function to handle update request
const updateMeetingLink = async (req, res) => {
  const { id } = req.params;
  const { name, email, project, meetingLink } = req.body;

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).send("Project not found.");
    }

    const updatedMeetingLink = await MeetingLink.findByIdAndUpdate(
      id,
      { name, email, project },
      { new: true }
    );

    if (!updatedMeetingLink) {
      return res.status(404).send("Meeting link not found.");
    }

    await sendMeetingLink(email, meetingLink, projectDoc.name);
    res.status(200).send("Meeting link updated and email sent successfully.");
  } catch (error) {
    console.error("Error updating meeting link:", error);
    res.status(500).send("Error updating meeting link.");
  }
};

// Controller function to handle delete request
const deleteMeetingLink = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMeetingLink = await MeetingLink.findByIdAndDelete(id);

    if (!deletedMeetingLink) {
      return res.status(404).send("Meeting link not found.");
    }

    res.status(200).send("Meeting link deleted successfully.");
  } catch (error) {
    console.error("Error deleting meeting link:", error);
    res.status(500).send("Error deleting meeting link.");
  }
};

// Controller function to handle get request
const getMeetingLink = async (req, res) => {
  const { id } = req.params;

  try {
    const meetingLink = await MeetingLink.findById(id).populate("project");

    if (!meetingLink) {
      return res.status(404).send("Meeting link not found.");
    }

    res.status(200).json(meetingLink);
  } catch (error) {
    console.error("Error retrieving meeting link:", error);
    res.status(500).send("Error retrieving meeting link.");
  }
};

// Controller function to handle get all request with pagination
const getAllMeetingLinks = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const meetingLinks = await MeetingLink.find()
      .populate("project")
      .skip((page - 1) * limit) // Skip the appropriate number of documents
      .limit(parseInt(limit)); // Limit the number of documents

    const totalDocuments = await MeetingLink.countDocuments(); // Total number of documents in collection
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      meetingLinks,
    });
  } catch (error) {
    console.error("Error retrieving meeting links:", error);
    res.status(500).send("Error retrieving meeting links.");
  }
};

module.exports = {
  createMeetingLink,
  updateMeetingLink,
  deleteMeetingLink,
  getMeetingLink,
  getAllMeetingLinks,
};
