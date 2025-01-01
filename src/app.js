import path from "path";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import generalRoutes from "./routes/general.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import flash from "connect-flash";
import errorController from "./controllers/error.js";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import compression from "compression";

import User from "./models/user.js";

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongodb-nodejs.hfqzv.mongodb.net/${process.env.MONGO_DATABASE}`;

const app = express();
const store = new MongoDBStore(session)({
  uri: MONGO_URI,
  collection: "sesions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "_" + file.originalname);
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("myfile")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.role = "guest";
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      res.locals.role = user.role;
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(authRoutes);
app.use(generalRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use(paymentRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
