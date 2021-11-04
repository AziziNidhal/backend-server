const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/user");

router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid Email")
      .isLength({ min: 5 })
      .custom((value, { req }) => {
          const receivedEmail = req.body.email;
        return User.findOne({email:receivedEmail}).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail adress already exists");
          }
        });
      }),
    body("nickname")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        const receivedNickname = req.body.nickname;
      return User.findOne({nickname:receivedNickname}).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(`${receivedNickname} already used as nickname!`);
        }
      });
    }),
    
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Weak Password"),
  ],
  authController.signup
);


router.post("/login", authController.login);

module.exports = router;
