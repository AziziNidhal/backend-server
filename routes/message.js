const express = require("express");
const { body } = require("express-validator");

const messageController = require("../controllers/message");
const isAuth = require('../middleware/is-auth')

const router = express.Router();


//GET /message/:conversationId => req.params.conversationId
router.get("/:conversationId", isAuth ,messageController.getMessageByConversation);



//POST /message
router.post(
    "/",
    isAuth
    ,
    [
      body("content")
        .trim()
        .isLength({ min: 1 }),
        body("receiverId")
        .trim()
        .isLength({ min: 5 })
    ],
    messageController.createMessage
  );

  
module.exports = router;

