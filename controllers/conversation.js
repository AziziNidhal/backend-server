const { validationResult } = require("express-validator");

// const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation");
const User = require("../models/user");

exports.getConversations = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    try {


      const connectedUser = await User.findById(req.userId);

      const conversations = await Conversation.find({
        $or: [{ creator: connectedUser }, { withUser: connectedUser }],
      })
        .populate("creator", ["nickname", "imageUrl"])
        .populate("withUser", ["nickname", "imageUrl"]).sort({'updatedAt':-1});
      // const conversations = await Conversation.find({ creator: connectedUser } )

      if (!conversations || conversations.length === 0) {
        const error = new Error("No Conversation found.");
        error.statusCode = 404;
        throw error;
      }
      
      res.status(200).json({ conversations });
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

exports.createConversation = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    const withUserId = req.body.withUserId;

    try {
      const withUser = await User.findById(withUserId);
      if (!withUser || withUser.length === 0) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }

      const connectedUser = await User.findById(req.userId);

      const checkIfAlreadyExistAsCreator = await Conversation.find({
        creator: connectedUser,
        withUser: withUser,
      });
      const checkIfAlreadyExistAsWithUser = await Conversation.find({
        withUser: connectedUser,
        creator: withUser,
      });

      if (
        checkIfAlreadyExistAsCreator.length ||
        checkIfAlreadyExistAsWithUser.length
      ) {
        res
          .status(200)
          .json({ message: "A Conversation with this user already exist" });
        next();
      } else {
        const conversation = new Conversation({
          creator: connectedUser,
          withUser: withUser,
        });

        try {
          await conversation.save();
          res.status(201).json({
            message: "Conversation Created Successfully",
            conversation: {
              creator: {
                _id: conversation.creator._id,
                email: conversation.creator.email,
                nickname: conversation.creator.nickname,
                imageUrl: conversation.creator.imageUrl,
                status: conversation.creator.status,
              },
              withUser: {
                _id: conversation.withUser._id,
                email: conversation.withUser.email,
                nickname: conversation.withUser.nickname,
                imageUrl: conversation.withUser.imageUrl,
                status: conversation.withUser.status,
              },
              _id: conversation._id,
              createdAt: conversation.createdAt,
            },
          });
        } catch (err) {
          if (!err.statusCode) {
            err.statusCode = 500;
          }

          next(err);
        }
      }
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    }
  } catch (err) {
    next(err);
  }
};
