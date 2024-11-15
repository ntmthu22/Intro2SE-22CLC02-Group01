const express = require("express");

const privateController = require("../controllers/private");

const router = express.Router();

const isAuth = require("../middlewares/is-auth");

router.get("/", privateController.getIndex);

router.get("/features", privateController.getFeatures);

router.get("/testimonials", privateController.getTestimonials);

router.get("/about-us", privateController.getAboutUs);

module.exports = router;
