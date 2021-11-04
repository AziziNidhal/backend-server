const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }
  const email = req.body.email;
  const nickname = req.body.nickname;
  const password = req.body.password;

  let imageUrl;
  if (!req.file) {
    imageUrl = "images/default-avatar.png";
  } else {

    imageUrl = req.file.path.replace(String.fromCharCode(92), "/");
    imageUrl = imageUrl.replace(String.fromCharCode(92), "/");
  }

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      nickname: nickname,
      imageUrl: imageUrl,
    });

    const result = await user.save();
    res.status(201).json({ message: "User Created!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const nickname = req.body.nickname;
  const password = req.body.password;
  let loadedUser;

  try {

    const user = await User.findOne({ nickname: nickname });
    if (!user) {
      const error = new Error("A user with this nickname not found");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        nickname: loadedUser.nickname,
        userId: loadedUser._id.toString(),
      },
      "supersecretsupersecretsupersecret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString(),nickname:loadedUser.nickname,imageUrl:loadedUser.imageUrl, expiresIn:3600 });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
