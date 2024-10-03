const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "test356sales@gmail.com",
    pass: "ajjvnbfwmbrwbibg",
  },
});

//to can also take array of valid emails
async function sendEmail(to, subject, html) {
  return new Promise(async (resolve, reject) => {
    let info = await transporter
      .sendMail({
        from: "test356sales@gmail.com",
        to,
        subject,
        text: "Text Here!",
        html,
      })
      .catch((e) => {
        reject(e);
      });

    if (info?.messageId) {
      resolve("email sent");
    }
  });
}

async function sendVerifyEmail(name, email, id) {
  try {
    const mailOptions = {
      from: "test356sales@gmail.com",
      to: email,
      subject: "for Verification mail",
      html: `<p>Hi ${name},</p>
      <p>Please click here to <a href="http:localhost:3000/verify-account?id=${id}">verify your email</a>.</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}



const sendStatusChangeEmail = async (ticket) => {
  try {
    const mailOptions = {
      from: "test356sales@gmail.com",
      to: ticket.email, // assuming customerEmail is a field in the ticket document
      subject: `Ticket ${ticket._id} status updated to ${ticket.status}`,
      text: `Dear ${ticket.fullName}, 
  
  Your ticket ${ticket._id} has been updated to status ${ticket.status}. Please login to your account to view the updated ticket.
  
  Best regards,
  Your Support Team`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent to ${ticket.email}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendEmail, sendVerifyEmail, sendStatusChangeEmail };
