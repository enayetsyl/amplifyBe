const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const config = require("../../config/auth.config");
const randomstring = require("randomstring");
const ExcelJS = require("exceljs");
var jwt = require("jsonwebtoken");
const { sendEmail, sendVerifyEmail } = require("../../config/email.config");

const validatePassword = (password) => {
  const errors = [];

  if (password.length <= 8) {
    errors.push("Password must be exactly 8 characters long.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)."
    );
  }

  return errors.length > 0 ? errors : null;
};

const validateEmail = (email) => {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_PATTERN.test(email)) {
    return "Invalid email format.";
  }
  return null;
};

const signup = async (req, res) => {
  console.log("hello")
  try {
    const { firstName, lastName, email, password, role } = req.body;
console.log(req.body)
    if (!(firstName && lastName && email && password && role)) {
      return res
        .status(400)
        .json({ message: `All fields are required`, status: 400 });
    }

    const emailError = validateEmail(email);
    console.log(emailError)
    if (emailError) {
      return res.status(400).json({ message: emailError, status: 400 });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors) {
      return res
        .status(400)
        .json({ message: passwordErrors.join(" "), status: 400 });
    }

    const userExist = await userModel.findOne({ email: email }).select("_id");
    if (userExist) {
      return res
        .status(400)
        .json({ message: "Email already in use", status: 400 });
    }

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 8),
      role,
    });

    await newUser.save();

    sendVerifyEmail(firstName, email, newUser._id);

    return res.status(200).json({
      message: "User registered successfully. Please verify your email!",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const signin = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User Not found.", status: 404 });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 }); // 24 hours

    await userModel.findByIdAndUpdate(user._id, { token: token });

    return res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      createdBy: user.createdBy,
      joinedOn: user.joinedOn,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      accessToken: token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const update = async (req, res) => {
  try {
    // Handle file upload
    if (req.file) {
      const file = req.file;
      const filePath = `/uploads/${file.filename}`;
      req.body.profilePicture = filePath; // update profilePicture field with uploaded file path
    }

    delete req.body.password;
    const result = await userModel.findByIdAndUpdate(
      { _id: req.body._id || req.body.id },
      req.body,
      { new: true }
    );
    res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const deleteById = async (req, res) => {
  try {
    const result = await userModel.findByIdAndDelete({
      _id: req.query._id || req.query.id,
    });
    res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const findById = async (req, res) => {
  try {
    const result = await userModel.findById({
      _id: req.query._id || req.query.id,
    });
    res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const findAll = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const query = {};
    const result = await userModel
      .find(query)
      .limit(limit)
      .skip(limit * page);
    const totalRecords = await userModel.countDocuments(query);
    res.status(200).json({ result, totalRecords });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal server error." });
  }
};

const reset_password = async (req, res) => {
  try {
    const token = req.body.token;
    const tokenData = await userModel.findOne({ token: token });
    if (tokenData) {
      const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
      const UserData = await userModel.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "User password has been reset successfully",
        data: UserData,
      });
    } else {
      res.status(200).send({
        success: false,
        message: "Unauthorized.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const html = `<p> Hi ${name}, please copy the link <a href="https://abc.com/reset-password?token=${token}"> reset your password </a>.</p>`;
    await sendEmail(email, "For Reset password", html);
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      await userModel.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.firstName, userData.email, randomString);
      res.status(200).send({
        success: true,
        message: "Please check your inbox and reset your password",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "This email does not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const verifymail = async (req, res) => {
  try {
    const verifiedMail = await userModel.updateOne(
      { _id: req.query.id },
      { $set: { isEmailVerified: true } }
    );
    console.log(verifiedMail);
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const uploadUserExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ error: "Please upload a file.", status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    const worksheet = workbook.worksheets[0];
    const headers = [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
      "status",
      "createdBy",
    ];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value;
        });
        rows.push(rowData);
      }
    });

    for (const rowData of rows) {
      const email = rowData.email;
      const passwordErrors = validatePassword(rowData.password);
      if (passwordErrors) {
        return res
          .status(400)
          .json({ message: passwordErrors.join(" "), status: 400 });
      }

      const userExist = await userModel.findOne({ email: email }).select("_id");

      if (!userExist) {
        const newUser = new userModel({
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          email: rowData.email,
          password: bcrypt.hashSync(rowData.password, 8),
          role: rowData.role,
          status: rowData.status,
          createdBy: rowData.createdBy,
        });
        await newUser.save();
      }
    }

    return res.status(200).json({
      message: "Users imported successfully from Excel.",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const downloadUserExcel = async (req, res) => {
  try {
    const users = await userModel.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Role",
      "Status",
      "Created By",
      "Joined On",
      "Created At",
      "Updated At",
      "Last Login At",
    ];
    worksheet.addRow(headers);

    users.forEach((user) => {
      const row = [
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.status,
        user.createdBy,
        user.joinedOn,
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt,
      ];
      worksheet.addRow(row);
    });

    const filePath = "uploads/users.xlsx";
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "users.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

module.exports = {
  signup,
  signin,
  update,
  deleteById,
  findById,
  findAll,
  reset_password,
  forgotPassword,
  verifymail,
  uploadUserExcel,
  downloadUserExcel,
};
