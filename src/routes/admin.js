import express from "express";
import adminController from "../controllers/admin.js";
import checkRole from "../middlewares/check-role.js";
import { body } from "express-validator";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/profile", checkRole("admin"), adminController.getProfile);

router.get("/edit-profile", checkRole("admin"), adminController.getEditProfile);

router.get(
  "/edit-profile/name",
  checkRole("admin"),
  adminController.getEditProfileName
);

router.post(
  "/edit-profile/name",
  checkRole("admin"),
  [
    body("name", "Your name shouldn't be too long or too short")
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[^0-9]*$/)
      .withMessage("Your name shouldn't contain any numbers!"),
  ],
  adminController.postEditProfileName
);

router.get(
  "/edit-profile/password",
  checkRole("admin"),
  adminController.getEditProfilePassword
);

router.post(
  "/edit-profile/password",
  checkRole("admin"),
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
      .isLength({ min: 5 })
      .withMessage("Password must be 5 characters long!")
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
  adminController.postEditProfilePassword
);

router.get("/users", checkRole("admin"), adminController.getManage);

router.post(
  "/users/:userId/disable",
  checkRole("admin"),
  adminController.disableAccount
);

router.post(
  "/users/:userId/restore",
  checkRole("admin"),
  adminController.restoreAccount
);

router.get("/users/:userId", checkRole("admin"), adminController.getUserDetail);

router.get(
  "/users/:userId/activities",
  checkRole("admin"),
  adminController.getUserActivities
);

router.get(
  "/users/:userId/album",
  checkRole("admin"),
  adminController.getUserAlbum
);

router.get(
  "/user-product/:productId",
  checkRole("admin"),
  adminController.getUserProduct
);

router.get("/overall", checkRole("admin"), adminController.getOverall);

router.get("/giftcodes", checkRole("admin"), adminController.getGiftcodes);

router.post(
  "/generate-giftcode",
  checkRole("admin"),
  adminController.postGenerateGiftcode
);

router.delete(
  "/delete-giftcode",
  checkRole("admin"),
  adminController.deleteGiftcode
);

export default router;
