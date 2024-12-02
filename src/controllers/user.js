import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { Client } from "@gradio/client";
import { Blob } from "buffer"; // Built-in Node.js module for Blob
import fs from "fs/promises";
import Product from "../models/product.js";
import { extractDate, extractDateAndName } from "../utils/time.js";

const ITEMS_PER_PAGE = 6;
const PREVIEW_ITEMS = 2;

const userController = {
  getProfile: (req, res, next) => {
    Product.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(PREVIEW_ITEMS)
      .then((products) => {
        let updatedProducts = JSON.parse(JSON.stringify(products));

        updatedProducts = updatedProducts.map((product) => {
          product.dateAndName = extractDateAndName(product.originalImageUrl);
          return product;
        });

        let validUntil = undefined;

        if (req.user.membershipType === "Premium") {
          validUntil = extractDate(req.user.validUntil);
        }

        res.render("user/profile", {
          prods: updatedProducts,
          pageTitle: "Profile",
          path: "/user/profile",
          user: req.user,
          validUntil: validUntil,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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

    res.render("user/generate", {
      pageTitle: "Generate",
      path: "/user/generate",
      user: req.user,
      videoUrl: null,
      plyUrl: null,
      errorMessage: errorMessage,
      successMessage: successMessage,
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
      req.flash("error", "You haven't uploaded any image!");
      return res.status(404).redirect(`/${req.user.role}/generate`);
    }

    try {
      // const fileBuffer = await fs.readFile(image.path);
      // const imageBlob = new Blob([fileBuffer], { type: image.mimetype });
      // const app = await Client.connect("ashawkey/LGM");
      // const result = await app.predict("/process", [
      //   imageBlob, // blob in 'image' Image component
      //   promptInput, // string  in 'prompt' Textbox component
      //   negativePromptInput, // string  in 'negative prompt' Textbox component
      //   elevationInput, // number (numeric value between -90 and 90) in 'elevation' Slider component
      //   inferenceStepsInput, // number (numeric value between 1 and 100) in 'inference steps' Slider component
      //   randomSeedInput, // number (numeric value between 0 and 100000) in 'random seed' Slider component
      // ]);

      const originalImageUrl = image.path;
      // const convertedImageUrl = result.data[0].url;
      // const videoUrl = result.data[1].video.url;
      // const plyUrl = result.data[2].url;

      const product = new Product({
        originalImageUrl: originalImageUrl,
        convertedImageUrl: "hello",
        videoUrl: "hello",
        plyUrl: "hello",
        userId: req.user,
      });

      await product.save();
      req.user.products.push(product);
      await req.user.save();

      // return res.render("user/generate", {
      //   pageTitle: "Generate",
      //   path: "/user/generate",
      //   user: req.user,
      //   videoUrl: videoUrl,
      //   plyUrl: plyUrl,
      //   successMessage: "Success!",
      //   errorMessage: null,
      // });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
  getAlbum: (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find({ userId: req.user._id })
      .countDocuments()
      .then((numProducts) => {
        totalItems = numProducts;
        return Product.find({ userId: req.user._id })
          .sort({ createdAt: -1 })
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE);
      })
      .then((products) => {
        let updatedProducts = JSON.parse(JSON.stringify(products));

        updatedProducts = updatedProducts.map((product) => {
          product.dateAndName = extractDateAndName(product.originalImageUrl);
          return product;
        });

        res.render("album/product-list", {
          pageTitle: "Album",
          path: "/user/album",
          user: req.user,
          prods: updatedProducts,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
      });
  },
};

export default userController;
