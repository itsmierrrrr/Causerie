import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { ensureUniqueUsername, normalizeUsername } from "../utils/username.js";

export const register = async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    return res.status(409).json({ message: "Email already in use." });
  }

  const requestedUsername = normalizeUsername(username || name || email.split("@")[0]);
  const uniqueUsername = await ensureUniqueUsername(requestedUsername);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    username: uniqueUsername,
    passwordHash,
  });

  return res.status(201).json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.status(200).json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  });
};
