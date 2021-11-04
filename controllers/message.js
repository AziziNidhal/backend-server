const { validationResult } = require("express-validator");

// const jwt = require("jsonwebtoken");
const Message = require("../models/message");
const User = require("../models/user");
const Conversation = require("../models/conversation");

exports.getMessageByConversation = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    /*********** */
    try {
      const conversationId = req.params.conversationId;
      const connectedUser = await User.findById(req.userId);
      const conversation = await Conversation.find({
        $or: [{ creator: connectedUser }, { withUser: connectedUser }],
        _id: conversationId,
      });
      if (conversation) {
        const messages = await Message.find({ conversation: conversation }).populate("sender", ["nickname", "imageUrl"])
        .populate("receiver", ["nickname", "imageUrl"]);

        res.status(200).json(messages);
      }
    } catch (err) {}

    /******* */
  } catch (err) {}
};

exports.createMessage = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    const receiverId = req.body.receiverId;
    const content = req.body.content;

    try {
      const receiver = await User.findById(receiverId);
      if (!receiver || receiver.length === 0) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }

      const connectedUser = await User.findById(req.userId);

      const conversation = await Conversation.find({
        $or: [
          { creator: connectedUser, withUser: receiver },
          { creator: receiver, withUser: connectedUser },
        ],
      });

      console.log(conversation[0]);

      if (!conversation || !conversation.length) {
        const error = new Error("Cannot found the conversation.");
        error.statusCode = 404;
        throw error;
      }

      const message = new Message({
        sender: connectedUser,
        receiver: receiver,
        content: content,
        conversation: conversation[0],
      });

      try {
        await message.save();

        res.status(201).json({ message: "Message sent successfully" });
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }

        next(err);
      }
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
