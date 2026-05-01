import User from "../models/User.js";
import { normalizeUsername } from "../utils/username.js";

export const me = async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
    },
  });
};

export const updateUsername = async (req, res) => {
  const nextUsername = normalizeUsername(req.body.username);

  if (!nextUsername || nextUsername.length < 3) {
    return res.status(400).json({
      message: "Username must be at least 3 characters and contain only letters, numbers, or underscore.",
    });
  }

  if (nextUsername === req.user.username) {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
      },
    });
  }

  const exists = await User.exists({ username: nextUsername });
  if (exists) {
    return res.status(409).json({ message: "Username is already taken." });
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { username: nextUsername },
    { new: true }
  ).select("_id name email username");

  return res.status(200).json({
    user: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
    },
  });
};

export const searchUsers = async (req, res) => {
  const q = String(req.query.q || "").toLowerCase().trim();

  if (!q) {
    return res.json({ users: [] });
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { username: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
    ],
  })
    .select("_id name username")
    .limit(15);

  return res.json({
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      username: user.username,
    })),
  });
};
