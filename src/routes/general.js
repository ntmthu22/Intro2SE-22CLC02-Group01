const express = require("express");

const generalController = require("../controllers/general");

const router = express.Router();

const isAuth = require("../middlewares/is-auth");

router.get("/", generalController.getIndex);

router.get("/features", generalController.getFeatures);

router.get("/testimonials", generalController.getTestimonials);

router.get("/about-us", generalController.getAboutUs);

module.exports = router;
