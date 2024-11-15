const express = require("express");

const privateController = require("../controllers/private");

const router = express.Router();

const isAuth = require("../middlewares/is-auth");

router.get("/", privateController.getSlash);

router.get("/dashboard", isAuth, privateController.getDashboard);

module.exports = router;
