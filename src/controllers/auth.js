const { validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res) => {
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

  res.render("auth/log-in", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    successMessage: successMessage,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/sign-up", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.getReset = (req, res) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reest",
    pageTitle: "Reset",
    errorMessage: message,
    oldInput: {
      email: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/sign-up", {
      path: "/signup",
      pageTitle: "Signup",
      successMessage: "",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
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
      req.flash("success", "Sign up successful! Please log in!");
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "noreply.pic2model@gmail.com",
        subject: "Sign up completed!",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <h1 style="color: #007BFF;">Welcome to PIC2MODEL!</h1>
            <p style="font-size: 16px; color: #333;">Thank you for signing up with us. You're now part of a community that transforms 2D images into stunning 3D objects effortlessly.</p>
            <p style="font-size: 16px; color: #333;">Explore your account and start creating amazing 3D models today!</p>
            <a href="${req.protocol}://${req.get(
          "host"
        )}/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 4px;">Log in now</a>
            <p style="margin-top: 30px; font-size: 14px; color: #999;">If you have any questions, feel free to contact us at <a href="mailto:support@pic2model.com" style="color: #007BFF;">support@pic2model.com</a>.</p>
          </div>
        `,
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/log-in", {
      path: "/login",
      pageTitle: "Login",
      successMessage: "",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        return res.status(422).render("auth/log-in", {
          path: "/login",
          pageTitle: "Login",
          successMessage: "",
          errorMessage: "Incorrect password. Please try again!",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [
            {
              path: "password",
            },
          ],
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.postReset = (req, res) => {
  const email = req.body.email;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
      },
      validationErrors: errors.array(),
    });
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        req.flash("success", "We've sent a reset link to your email account");
        res.redirect("/login");
        return transporter.sendMail({
          to: email,
          from: "noreply.pic2model@gmail.com",
          subject: "Password Reset",
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href='${req.protocol}://${req.get(
            "host"
          )}/reset/${token}'>link</a> to set a new password</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Your reset link has expired");
        return res.redirect("/reset");
      }

      let message = req.flash("error");

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        oldInput: {
          password: "",
        },
        passwordToken: token,
        validationErrors: [],
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      successMessage: "",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        password: newPassword,
      },
      passwordToken: passwordToken,
      validationErrors: errors.array(),
      userId: userId,
    });
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      req.flash("success", "Your password has been reset!");
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
