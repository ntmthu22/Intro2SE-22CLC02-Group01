const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  if (req.session.isLoggedin) {
    res.redirect('/');
  } else {
    res.render("log-in", {
      pageTitle: "Login",
      errorMessage: null,
      username: "",
    });
  }
};

exports.getSignup = (req, res) => {
  if (req.session.isLoggedin) {
    res.redirect('/');
  } else {
    res.render("sign-up", {
      pageTitle: "Signup",
      errorMessage: null,
    });
  }
};

exports.postSignup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user) {
      // Flash the error message and return early to prevent further code execution
      req.flash("error", "User already exists!");
      return res.render("sign-up", {
        pageTitle: "Signup",
        errorMessage: req.flash("error"),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      req.session.isLoggedin = true;
      res.redirect("/");
    } else {
      req.flash("error", "Incorrect password! Please try again.");
      res.render("log-in", {
        pageTitle: "Login",
        errorMessage: req.flash("error"),
        username,
      });
    }
  } else {
    req.flash("error", "Username not found!");
    res.render("log-in", {
      pageTitle: "Login",
      errorMessage: req.flash("error"),
      username: "",
    });
  }
};
