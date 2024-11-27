import { validationResult } from "express-validator";
import crypto from "crypto";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const authController = {
  getLogin: (req, res) => {
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
  },
  getSignup: (req, res) => {
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
  },
  getReset: (req, res) => {
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
  },
  postSignup: (req, res, next) => {
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

        const templatePath = path.join(
          __dirname,
          "../views/emails/welcome-email.ejs"
        );
        const loginLink = `${req.protocol}://${req.get("host")}/login`;

        ejs.renderFile(templatePath, { loginLink }, (err, htmlContent) => {
          if (err) {
            console.log(err);
            return;
          }
          return transporter.sendMail({
            to: email,
            from: "noreply.pic2model@gmail.com",
            subject: "Sign up completed!",
            html: htmlContent,
          });
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postLogin: (req, res, next) => {
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
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },

  postReset: (req, res, next) => {
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

          const templatePath = path.join(
            __dirname,
            "../views/emails/reset-password-email.ejs"
          );
          const resetLink = `${req.protocol}://${req.get(
            "host"
          )}/reset/${token}`;

          ejs.renderFile(templatePath, { resetLink }, (err, htmlContent) => {
            if (err) {
              console.log(err);
              return;
            }

            return transporter.sendMail({
              to: email,
              from: "noreply.pic2model@gmail.com",
              subject: "Password Reset",
              html: htmlContent,
            });
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  },
  postLogout: (req, res) => {
    req.session.destroy((err) => {
      console.log(err);
      res.redirect("/");
    });
  },
  getNewPassword: (req, res, next) => {
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
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postNewPassword: (req, res, next) => {
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
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
};

export default authController;
