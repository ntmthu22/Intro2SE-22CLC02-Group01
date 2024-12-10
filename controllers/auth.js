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
      api_key: process.env.SENDGRID_API,
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
        const loginLink = `${process.env.HEROKU_APP_URL}/login`;

        ejs.renderFile(templatePath, { loginLink }, (err, htmlContent) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Rendered HTML Content:", htmlContent); // Check output
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
  postLogin: async (req, res, next) => {
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

    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        throw new Error("User not found!");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
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
      }

      if (user.status === "disabled") {
        req.flash(
          "error",
          "Your account has been disabled, please connect Admin to restore it."
        );
        return res.status(403).redirect("/login");
      }

      user.loginTimestamps.push(new Date());
      if (user.loginTimestamps.length > 100) {
        user.loginTimestamps.shift(); // Remove the oldest timestamp
      }
      await user.save();

      req.session.isLoggedIn = true;
      req.session.user = user;
      req.flash("success", `Welcome back, ${user.name}!`);
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
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
          req.flash(
            "success",
            "We have sent a reset link to your email account"
          );
          res.redirect("/login");

          const templatePath = path.join(
            __dirname,
            "../views/emails/reset-password-email.ejs"
          );
          const resetLink = `${process.env.HEROKU_APP_URL}/reset/${token}`;

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
      if (err) {
        console.log(err);
      }
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
