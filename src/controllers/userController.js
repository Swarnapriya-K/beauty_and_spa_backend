const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const XLSX = require("xlsx");
const csv = require("fast-csv");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Add await to the database query
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password before saving

    const user = new User({
      username,
      password,
      role: role || "user"
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({
      // Use 500 for server errors
      error: "Error registering user",
      details: err.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );
    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Error logging in", details: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the User model
    const users = await User.find();

    // Respond with the list of users
    return res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    // Handle any errors during the database query
    console.error("Error fetching users:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users. Please try again later.",
      error: error.message
    });
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access denied, token missing" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

const exportUsersCsv = async (req, res) => {
  try {
  const users = await User.find().exec();
  console.log(users)

  const flattenedData = users.map((row) => ({
    Username: row.username,
  
    Role: row.role,
    CreatedOn: row.createdAt
  }));


    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    flattenedData.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Internal service error");
  }
};

const exportUsersExcel = async (req, res) => {
  try {
    const users = await User.find().exec();

    const flattenedData = users.map((row) => ({
      Username:row.username,
   
      Role:row.role,
      CreatedOn:row.createdAt
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const filepath = "Users.xlsx";
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, "Users.xlsx", (err) => {
      if (err) console.log("error", err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};
const exportUsersPdf = async (req, res) => {
  try {
     const users = await User.find().exec();

     const flattenedData = users.map((row) => ({
       Username: row.username,
       Role: row.role,
       CreatedOn: row.createdAt
     }));

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    // Create a PDF document and pipe it to the response
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add content to the PDF
    pdfDoc.fontSize(16).text("Users List", { align: "center" });
    pdfDoc.moveDown();

    flattenedData.forEach((user, index) => {
      pdfDoc
        .fontSize(12)
        .text(`Username: ${user.Username}`)
        .text(`Role: ${user.Role}`)
        .text(`CreatedOn: ${user.CreatedOn}`)
        
        .moveDown();
    });

    // Finalize the PDF
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = { registerUser, loginUser, authMiddleware, getAllUsers ,exportUsersPdf,exportUsersExcel,exportUsersCsv};
