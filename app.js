const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");

const app = express();

const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "images");
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const supportedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (supportedTypes.indexOf(file.mimetype) > -1) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversation", conversationRoutes);
app.use("/message",messageRoutes);

app.use((error, req, res, next) => {
  console.log('**********************************************')
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message,data });
});

//myFirstDatabase
mongoose
  .connect(
    "mongodb+srv://technical-test:I<3leboncoin@leboncoin.wk7y1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    const error = new Error("Cant Connect to the database");
    error.statusCode = 500;
    throw error;
  });
