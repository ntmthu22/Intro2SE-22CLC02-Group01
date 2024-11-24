const express = require("express");

const privateController = require("../controllers/private");

const router = express.Router();

const bcrypt = require("bcryptjs");

const isAuth = require("../middlewares/is-auth");

const { body } = require("express-validator");

const User = require("../models/user");

router.get("/profile", isAuth, privateController.getProfile);

router.get("/edit-profile", isAuth, privateController.getEditProfile);

router.get("/edit-profile/name", isAuth, privateController.getEditProfileName);

router.post(
  "/edit-profile/name",
  isAuth,
  [
    body("name", "Your name shouldn't be too long or too short")
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[^0-9]*$/)
      .withMessage("Your name shouldn't contain any numbers!"),
  ],
  privateController.postEditProfileName
);

router.get(
  "/edit-profile/email",
  isAuth,
  privateController.getEditProfileEmail
);

router.post(
  "/edit-profile/email",
  isAuth,
  [
    body("email", "Invalid email!")
      .trim()
      .normalizeEmail()
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email already exists!");
        }
      }),
  ],

  privateController.postEditProfileEmail
);

router.get(
  "/edit-profile/password",
  isAuth,
  privateController.getEditProfilePassword
);

router.post(
  "/edit-profile/password",
  isAuth,
  [
    body("password")
      .trim()
      .custom(async (value, { req }) => {
        const isMatch = await bcrypt.compare(value, req.user.password);

        if (!isMatch) {
          return Promise.reject("Password incorrect");
        }
      }),
    body("newPassword")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Password must be 10 characters long!")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter!")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character!")
      .custom(async (value, { req }) => {
        const isMatch = await bcrypt.compare(value, req.user.password);
        if (isMatch) {
          return Promise.reject("This one is already in use");
        }
      }),
    body("confirmNewPassword")
      .trim()
      .custom(async (value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  privateController.postEditProfilePassword
);

router.get("/generate", isAuth, privateController.getGenerate);

module.exports = router;
