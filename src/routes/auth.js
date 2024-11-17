const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();
const isNotAuth = require("../middlewares/is-not-auth");
const User = require("../models/user");
const { check, body } = require("express-validator");

router.get("/login", isNotAuth, authController.getLogin);

router.get("/signup", isNotAuth, authController.getSignup);

router.post(
  "/login",
  isNotAuth,
  [
    check("email", "Invalid Email!")
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) {
          return Promise.reject("No user found with this Email");
        }
      }),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  isNotAuth,
  [
    check("name")
      .matches(/^[^0-9]*$/)
      .withMessage("Your name shouldn't contain any numbers!"),
    check("email", "Invalid Email!")
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email already exists!");
        }
      }),
    body("password")
      .isLength({ min: 10 })
      .withMessage("Password must be 10 characters long!")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter!")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special charac†er!"),
    body("confirmPassword").custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

module.exports = router;
