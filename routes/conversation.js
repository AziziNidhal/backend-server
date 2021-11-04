const express = require("express");
const { body } = require("express-validator");

const conversationController = require("../controllers/conversation");
const isAuth = require('../middleware/is-auth')

const router = express.Router();



//GET /conversation
router.get("/", isAuth ,conversationController.getConversations);

//POST /conversation
router.post(
    "/",
    isAuth
    ,
    [
      body("withUserId")
        .trim()
        .isLength({ min: 5 })
    ],
    conversationController.createConversation
  );



module.exports = router;
