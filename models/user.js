const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: "Available",
  },
//   conversations: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Conversation",
//     },
//   ],
});

module.exports = mongoose.model("User", userSchema);
