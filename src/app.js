const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const authRoutes = require("./routes/auth");
const privateRoutes = require("./routes/private");
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "everywhere at the end of time",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});
app.use(authRoutes);
app.use(privateRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
