const express = require("express");

const privateController = require("../controllers/private");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.redirect("/dashboard");
});

router.get("/dashboard", privateController.getDashboard);

module.exports = router;
