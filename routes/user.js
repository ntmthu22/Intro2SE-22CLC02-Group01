import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import User from "../models/user.js";
import userController from "../controllers/user.js";
import checkRole from "../middlewares/check-role.js";
import checkMembership from "../middlewares/check-membership.js";

const router = express.Router();

router.get(
  "/profile",
  checkRole("user"),
  checkMembership,
  userController.getProfile
);
router.get(
  "/edit-profile",
  checkRole("user"),
  checkMembership,
  userController.getEditProfile
);
router.get(
  "/edit-profile/name",
  checkRole("user"),
  userController.getEditProfileName
);

router.post(
  "/edit-profile/name",
  checkRole("user"),
  [
    body("name", "Your name shouldn't be too long or too short")
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[^0-9]*$/)
      .withMessage("Your name shouldn't contain any numbers!"),
  ],
  userController.postEditProfileName
);

router.get(
  "/edit-profile/email",
  checkRole("user"),
  userController.getEditProfileEmail
);

router.post(
  "/edit-profile/email",
  checkRole("user"),
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

  userController.postEditProfileEmail
);

router.get(
  "/edit-profile/password",
  checkRole("user"),
  userController.getEditProfilePassword
);

router.post(
  "/edit-profile/password",
  checkRole("user"),
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
  userController.postEditProfilePassword
);

router.get(
  "/generate",
  checkRole("user"),
  checkMembership,
  userController.getGenerate
);

router.post("/generate", checkRole("user"), userController.postGenerate);

router.get("/album", checkRole("user"), userController.getAlbum);

router.get("/album/:productId", checkRole("user"), userController.getProduct);

router.delete(
  "/delete-product/:productId",
  checkRole("user"),
  userController.deleteProduct
);

export default router;
