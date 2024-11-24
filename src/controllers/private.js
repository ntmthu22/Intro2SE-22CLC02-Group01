const { validationResult } = require("express-validator");
// const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getProfile = (req, res, next) => {
  res.render("private/profile", {
    pageTitle: "Profile",
    path: "/profile",
    fullName: req.user.name,
    email: req.user.email,
  });
};

exports.getEditProfile = (req, res, next) => {
  let errorMessage = req.flash("error");

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  let successMessage = req.flash("success");

  if (successMessage.length > 0) {
    successMessage = successMessage[0];
  } else {
    successMessage = null;
  }

  res.render("private/edit-profile", {
    pageTitle: "Edit Profile",
    path: "/edit-profile",
    fullName: req.user.name,
    email: req.user.email,
    successMessage: successMessage,
    errorMessage: errorMessage,
  });
};

exports.getEditProfileName = (req, res, next) => {
  res.render("private/edit-profile-name", {
    pageTitle: "Edit Name",
    path: "/edit-profile/name",
    fullName: req.user.name,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.getEditProfileEmail = (req, res, next) => {
  res.render("private/edit-profile-email", {
    pageTitle: "Edit Email",
    path: "/edit-profile/email",
    email: req.user.email,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postEditProfileName = (req, res) => {
  const name = req.body.name;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("private/edit-profile-name", {
      pageTitle: "Edit Name",
      path: "/edit-profile/name",
      fullName: name,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  req.user.name = name;

  req.user
    .save()
    .then(() => {
      req.flash("success", "Name changed!");
      res.redirect("/edit-profile");
    })
    .catch((err) => console.log(err));
};

exports.postEditProfileEmail = (req, res) => {
  const email = req.body.email;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("private/edit-profile-email", {
      pageTitle: "Edit Email",
      path: "/edit-profile/email",
      email: email,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  req.user.email = email;

  req.user
    .save()
    .then(() => {
      req.flash("success", "Email changed!");
      res.redirect("/edit-profile");
    })
    .catch((err) => console.log(err));
};

exports.getEditProfilePassword = (req, res) => {
  res.render("private/edit-profile-password", {
    pageTitle: "Edit Password",
    path: "/edit-profile/password",
    oldInput: {
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postEditProfilePassword = async (req, res, next) => {
  const { password, newPassword, confirmNewPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("private/edit-profile-password", {
      pageTitle: "Edit Password",
      path: "/edit-profile/password",
      oldInput: {
        password: password,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    req.user.password = newHashedPassword;
    await req.user.save();
    req.flash("success", "Password changed!");
    res.redirect("/edit-profile");
  } catch (err) {
    console.log(err);
  }
};

exports.getGenerate = (req, res, next) => {};
