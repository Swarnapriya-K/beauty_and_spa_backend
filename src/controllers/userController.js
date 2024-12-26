const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role: role || "user" });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Error registering user", details: err.message });
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

module.exports = { registerUser, loginUser, authMiddleware };
