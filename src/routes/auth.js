import express from "express";
import authController from "../controllers/auth.js";
import isNotAuth from "../middlewares/is-not-auth.js";
import User from "../models/user.js";
import { check, body } from "express-validator";

const router = express.Router();

router.get("/login", isNotAuth, authController.getLogin);

router.get("/signup", isNotAuth, authController.getSignup);

router.get("/reset", isNotAuth, authController.getReset);

router.get("/reset/:token", isNotAuth, authController.getNewPassword);

router.post(
  "/login",
  isNotAuth,
  [
    check("email", "Invalid email!")
      .trim()
      .normalizeEmail()
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) {
          return Promise.reject("No user found with this email");
        }
      }),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  isNotAuth,
  [
    check("name", "Your name shouldn't be too long or too short")
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[^0-9]*$/)
      .withMessage("Your name shouldn't contain any numbers!"),
    check("email", "Invalid email!")
      .trim()
      .normalizeEmail()
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email already exists!");
        }
      }),
    body("password")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Password must be 10 characters long!")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter!")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character!"),
    body("confirmPassword")
      .trim()
      .custom(async (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post(
  "/reset",
  isNotAuth,
  [
    body("email", "Invalid email!")
      .trim()
      .normalizeEmail()
      .isEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) {
          return Promise.reject("No user found with this email");
        }
      }),
  ],
  authController.postReset
);

router.post(
  "/new-password",
  isNotAuth,
  [
    body("password")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Password must be 10 characters long!")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter!")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character!"),
  ],
  authController.postNewPassword
);

router.post("/logout", authController.postLogout);

export default router;
