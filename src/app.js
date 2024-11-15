const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const privateRoutes = require("./routes/private");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const errorController = require("./controllers/error");

const User = require("./models/user");

dotenv.config();

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sesions",
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "everywhere at the end of time",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(authRoutes);
app.use(privateRoutes);
app.use(errorController.get404);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
