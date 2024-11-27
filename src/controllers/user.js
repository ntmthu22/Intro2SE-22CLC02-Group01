import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { Client } from "@gradio/client";
import { Blob } from "buffer"; // Built-in Node.js module for Blob
import fs from "fs/promises";

const userController = {
  getProfile: (req, res, next) => {
    res.render("user/profile", {
      pageTitle: "Profile",
      path: "/user/profile",
      user: req.user,
    });
  },
  getEditProfile: (req, res, next) => {
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

    res.render("user/edit-profile", {
      pageTitle: "Edit Profile",
      path: "/user/edit-profile",
      user: req.user,
      successMessage: successMessage,
      errorMessage: errorMessage,
    });
  },
  getEditProfileName: (req, res, next) => {
    res.render("user/edit-profile-name", {
      pageTitle: "Edit Name",
      path: "/user/edit-profile/name",
      originalName: req.user.name,
      user: req.user,
      errorMessage: null,
      validationErrors: [],
    });
  },
  getEditProfileEmail: (req, res, next) => {
    res.render("user/edit-profile-email", {
      pageTitle: "Edit Email",
      path: "/user/edit-profile/email",
      originalEmail: req.user.email,
      user: req.user,
      errorMessage: null,
      validationErrors: [],
    });
  },
  postEditProfileName: (req, res, next) => {
    const name = req.body.name;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/edit-profile-name", {
        pageTitle: "Edit Name",
        path: "/user/edit-profile/name",
        originalName: req.user.name,
        user: {
          name: name,
          role: req.user.role,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    req.user.name = name;

    req.user
      .save()
      .then(() => {
        req.flash("success", "Name changed!");
        res.redirect("/user/edit-profile");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postEditProfileEmail: (req, res, next) => {
    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/edit-profile-email", {
        pageTitle: "Edit Email",
        path: "/user/edit-profile/email",
        originalEmail: req.user.email,
        user: {
          email: email,
          role: req.user.role,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    req.user.email = email;

    req.user
      .save()
      .then(() => {
        req.flash("success", "Email changed!");
        res.redirect("/user/edit-profile");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  getEditProfilePassword: (req, res) => {
    res.render("user/edit-profile-password", {
      pageTitle: "Edit Password",
      path: "/user/edit-profile/password",
      user: req.user,
      oldInput: {
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      errorMessage: null,
      validationErrors: [],
    });
  },
  postEditProfilePassword: async (req, res, next) => {
    const { password, newPassword, confirmNewPassword } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/edit-profile-password", {
        pageTitle: "Edit Password",
        path: "/user/edit-profile/password",
        user: req.user,
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
      res.redirect("/user/edit-profile");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getGenerate: (req, res, next) => {
    res.render("user/generate", {
      pageTitle: "Generate",
      path: "/user/generate",
      user: req.user,
    });
  },

  postGenerate: async (req, res, next) => {
    const image = req.file;

    const {
      elevation,
      inferenceSteps,
      randomSeed,
      promptInput,
      negativePromptInput,
    } = req.body;

    const elevationInput = Number(elevation);
    const inferenceStepsInput = Number(inferenceSteps);
    const randomSeedInput = Number(randomSeed);

    if (!image) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const fileBuffer = await fs.readFile(image.path);
      const imageBlob = new Blob([fileBuffer], { type: image.mimetype });
      const app = await Client.connect("ashawkey/LGM");
      const result = await app.predict("/process", [
        imageBlob, // blob in 'image' Image component
        promptInput, // string  in 'prompt' Textbox component
        negativePromptInput, // string  in 'negative prompt' Textbox component
        elevationInput, // number (numeric value between -90 and 90) in 'elevation' Slider component
        inferenceStepsInput, // number (numeric value between 1 and 100) in 'inference steps' Slider component
        randomSeedInput, // number (numeric value between 0 and 100000) in 'random seed' Slider component
      ]);
      console.log(result.data);
      res.redirect(`/${req.user.role}/generate`);
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};

export default userController;
