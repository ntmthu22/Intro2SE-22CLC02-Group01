const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const email = req.query.email || "";
  res.render("auth/log-in", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: email },
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const name = req.query.name || "";
  const email = req.query.email || "";

  res.render("auth/sign-up", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      name: name,
      email: email,
    },
  });
};

exports.postSignup = async (req, res) => {
  const { name, email, password, passwordConfirmation } = req.body;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email already exists!");
        return res.redirect(`/signup?name=${encodeURIComponent(name)}`);
      }
      if (password !== passwordConfirmation) {
        req.flash("error", "Password does not match!");
        return res.redirect(
          `/signup?name=${encodeURIComponent(name)}&email=${encodeURIComponent(
            email
          )}`
        );
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Password is not correct. Please try again!");
          return res.redirect(`/login?email=${encodeURIComponent(email)}`);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
