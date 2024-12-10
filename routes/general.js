import express from "express";

import generalController from "../controllers/general.js";

const router = express.Router();

router.get("/", generalController.getIndex);

router.get("/features", generalController.getFeatures);

router.get("/testimonials", generalController.getTestimonials);

router.get("/about-us", generalController.getAboutUs);

export default router;
