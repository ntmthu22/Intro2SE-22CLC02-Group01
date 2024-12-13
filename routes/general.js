import express from "express";

import generalController from "../controllers/general.js";

const router = express.Router();

router.get("/", generalController.getIndex);

router.get("/samples", generalController.getSamples);

router.get("/testimonials", generalController.getTestimonials);

router.get("/about", generalController.getAbout);

export default router;
