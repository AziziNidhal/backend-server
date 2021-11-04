const jwt = require("jsonwebtoken");
const User = require("../models/user");


exports.getUsers = async (req, res, next) => {
    try {
      const users = await User.find().select({'password':0});
      if (!users || users.length === 0) {
        const error = new Error("Could not find users.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ users });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
  
      next(err);
    }
  
  
  };