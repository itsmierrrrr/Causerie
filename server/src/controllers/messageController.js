import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const toClientMessage = (message) => ({
  id: message._id,
  sender: String(message.sender),
  receiver: String(message.receiver),
  text: message.text,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

export const getMessagesWithUser = async (req, res) => {
  const otherUserId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const otherUser = await User.findById(otherUserId).select("_id name username");
  if (!otherUser) {
    return res.status(404).json({ message: "User not found." });
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  return res.json({
    peer: {
      id: otherUser._id,
      name: otherUser.name,
      username: otherUser.username,
    },
    messages: messages.map(toClientMessage),
  });
};

export const sendMessage = async (req, res) => {
  const otherUserId = req.params.userId;
  const text = String(req.body.text || "").trim();

  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  if (!text) {
    return res.status(400).json({ message: "Message cannot be empty." });
  }

  if (text.length > 1500) {
    return res.status(400).json({ message: "Message is too long." });
  }

  const otherUser = await User.findById(otherUserId).select("_id name username");
  if (!otherUser) {
    return res.status(404).json({ message: "User not found." });
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: otherUserId,
    text,
  });

  const payload = {
    ...toClientMessage(message),
    senderProfile: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
    },
    receiverProfile: {
      id: otherUser._id,
      name: otherUser.name,
      username: otherUser.username,
    },
  };

  const io = req.app.get("io");
  io.to(String(req.user._id)).emit("message:new", payload);
  io.to(String(otherUser._id)).emit("message:new", payload);

  return res.status(201).json({ message: payload });
};

export const getConversations = async (req, res) => {
  const userId = req.user._id;

  const latestMessages = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      $addFields: {
        chatPartner: {
          $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$chatPartner",
        latestMessage: { $first: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $unwind: "$partner" },
    {
      $project: {
        _id: 0,
        user: {
          id: "$partner._id",
          name: "$partner.name",
          username: "$partner.username",
        },
        latestMessage: {
          id: "$latestMessage._id",
          sender: "$latestMessage.sender",
          receiver: "$latestMessage.receiver",
          text: "$latestMessage.text",
          createdAt: "$latestMessage.createdAt",
        },
      },
    },
    { $sort: { "latestMessage.createdAt": -1 } },
  ]);

  return res.json({ conversations: latestMessages });
};
