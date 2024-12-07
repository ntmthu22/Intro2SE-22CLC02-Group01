import express from "express";
import adminController from "../controllers/admin.js";

const router = express.Router();

router.get("/profile", adminController.getProfile);

router.get("/edit-profile", adminController.getEditProfile);

router.get("/edit-profile/name", adminController.getEditProfileName);

router.get("/edit-profile/password", adminController.getEditProfilePassword);

export default router;
