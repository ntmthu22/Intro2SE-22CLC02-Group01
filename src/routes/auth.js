const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

const isNotAuth = require("../middlewares/is-not-auth");

router.get("/login", isNotAuth, authController.getLogin);

router.get("/signup", isNotAuth, authController.getSignup);

router.post("/signup", isNotAuth, authController.postSignup);

router.post("/login", isNotAuth, authController.postLogin);

module.exports = router;
