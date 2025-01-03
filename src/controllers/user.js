import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { Client } from "@gradio/client";
import { Blob } from "buffer";
import fs from "fs/promises";
import Product from "../models/product.js";
import Log from "../models/log.js";
import { extractLocalDateAndTime, extractDateAndName } from "../utils/time.js";
import { deleteFile } from "../utils/file.js";
import Giftcode from "../models/giftcode.js";

const ITEMS_PER_PAGE = 6;
const PREVIEW_ITEMS = 2;

const userController = {
  getProfile: (req, res, next) => {
    let successMessage = req.flash("success")[0] || null;

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
          validUntil = extractLocalDateAndTime(req.user.validUntil);
        }

        res.render("user/profile", {
          prods: updatedProducts,
          pageTitle: "Profile",
          path: "/user/profile",
          user: req.user,
          validUntil: validUntil,
          successMessage: successMessage,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
      });
  },
  getEditProfile: (req, res, next) => {
    let successMessage = req.flash("success")[0] || null;

    res.render("user/edit-profile", {
      pageTitle: "Edit Profile",
      path: "/user/edit-profile",
      user: req.user,
      successMessage: successMessage,
    });
  },
  getEditProfileName: (req, res, next) => {
    res.render("user/edit-profile-name", {
      pageTitle: "Edit Name",
      path: "/user/edit-profile/name",
      originalName: req.user.name,
      username: req.user.name,
      errorMessage: null,
      validationErrors: [],
    });
  },
  getEditProfileEmail: (req, res, next) => {
    res.render("user/edit-profile-email", {
      pageTitle: "Edit Email",
      path: "/user/edit-profile/email",
      originalEmail: req.user.email,
      usermail: req.user.email,
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
        username: name,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    req.user.name = name;

    req.user
      .save()
      .then(() => {
        req.flash("success", "Name changed!");
        res.status(200).redirect("/user/edit-profile");
      })
      .catch((err) => {
        const error = new Error(err);
        error.statusCode = 500;
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
        usermail: email,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    req.user.email = email;

    req.user
      .save()
      .then(() => {
        req.flash("success", "Email changed!");
        res.status(200).redirect("/user/edit-profile");
      })
      .catch((err) => {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
      });
  },
  getEditProfilePassword: (req, res) => {
    res.render("user/edit-profile-password", {
      pageTitle: "Edit Password",
      path: "/user/edit-profile/password",
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
      res.status(200).redirect("/user/edit-profile");
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    }
  },

  getGenerate: (req, res, next) => {
    let errorMessage = req.flash("error")[0] || null;
    let successMessage = req.flash("success")[0] || null;

    res.render("user/generate", {
      pageTitle: "Generate",
      path: "/user/generate",
      membershipType: req.user.membershipType,
      videoUrl: null,
      plyUrl: null,
      errorMessage: errorMessage,
      successMessage: successMessage,
    });
  },
  postGenerate: async (req, res, next) => {
    const image = req.file;

    let inputs = {
      promptInput: "",
      negativePromptInput:
        "ugly, blurry, pixelated obscure, unnatural colors, poor lighting, dull, unclear, cropped, lowres, low quality, artifacts, duplicate",
      elevation: 0,
      inferenceSteps: 30,
      randomSeed: 0,
    };

    if (req.user.membershipType === "Premium") {
      const {
        elevation,
        inferenceSteps,
        randomSeed,
        promptInput,
        negativePromptInput,
      } = req.body;

      inputs = {
        promptInput: promptInput,
        negativePromptInput: negativePromptInput,
        elevation: Number(elevation),
        inferenceSteps: Number(inferenceSteps),
        randomSeed: Number(randomSeed),
      };
    }

    if (!image) {
      req.flash(
        "error",
        "You haven not uploaded any image! Supported types: JPG/PNG"
      );
      return res.status(404).redirect(`/user/generate`);
    }

    const originalImageUrl = image.path;

    try {
      const fileBuffer = await fs.readFile(image.path);
      const imageBlob = new Blob([fileBuffer], { type: image.mimetype });
      const app = await Client.connect("ashawkey/LGM");
      const result = await app.predict("/process", [
        imageBlob, // blob in 'image' Image component
        inputs.promptInput,
        inputs.negativePromptInput,
        inputs.elevation,
        inputs.inferenceSteps,
        inputs.randomSeed,
      ]);

      const convertedImageUrl = result.data[0].url;
      const videoUrl = result.data[1].video.url;
      const plyUrl = result.data[2].url;

      const product = new Product({
        originalImageUrl: originalImageUrl,
        convertedImageUrl: convertedImageUrl,
        videoUrl: videoUrl,
        plyUrl: plyUrl,
        userId: req.user,
        inputs,
        status: "success",
      });

      await product.save();
      req.user.products.push(product);
      await req.user.save();

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const userId = req.user._id;

      let log = await Log.findOne({ userId, year, month });

      if (!log) {
        log = new Log({
          userId,
          year,
          month,
        });
      }

      log.count += 1;
      await log.save();

      return res.status(200).render("user/generate", {
        pageTitle: "Generate",
        path: "/user/generate",
        membershipType: req.user.membershipType,
        videoUrl: videoUrl,
        plyUrl: plyUrl,
        successMessage: "Your 3D model is here. Enjoy!",
        errorMessage: null,
      });
    } catch (err) {
      const product = new Product({
        originalImageUrl: originalImageUrl,
        userId: req.user,
        inputs,
        status: "failed",
      });

      await product.save();
      req.user.products.push(product);
      await req.user.save();

      req.flash("error", err.message);
      return res.status(500).redirect("/user/generate");
    }
  },
  getAlbum: async (req, res, next) => {
    const page = Math.max(+req.query.page || 1, 1);
    let lastPage;

    try {
      const totalItems = await Product.find({
        userId: req.user._id,
      }).countDocuments();

      lastPage = totalItems > 0 ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 1;

      if (page > lastPage || page < 1) {
        return res.redirect(`/user/album?page=${lastPage}`);
      }

      const products = await Product.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      let updatedProducts = JSON.parse(JSON.stringify(products));
      updatedProducts = updatedProducts.map((product) => {
        product.dateAndName = extractDateAndName(product.originalImageUrl);
        return product;
      });

      res.render("album/product-list", {
        pageTitle: "Album",
        path: "/user/album",
        username: req.user.name,
        prods: updatedProducts,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: lastPage,
        viewAsAdmin: false,
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    }
  },
  getProduct: (req, res, next) => {
    const productId = req.params.productId;
    Product.findOne({ _id: productId })
      .then((product) => {
        const { date, name } = extractDateAndName(product.originalImageUrl);
        res.render("album/product-detail", {
          pageTitle: "Product Detail",
          path: "/user/album",
          username: req.user.name,
          product: product,
          date: date,
          name: name,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
      });
  },
  deleteProduct: async (req, res, next) => {
    const productId = req.params.productId;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found!" });
      }
      await Product.deleteOne({ _id: productId, userId: req.user._id });

      req.user.products.pull(productId);
      await req.user.save();

      deleteFile(product.originalImageUrl);

      return res.status(200).json({ message: "Deleted item successfully!" });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    }
  },
  getGiftcode: (req, res, next) => {
    res.render("user/giftcode", {
      pageTitle: "Giftcode",
      path: "/user/giftcode",
      errorMessage: "",
      validationErrors: [],
    });
  },
  postGiftcode: async (req, res, next) => {
    const giftcodeValue = req.body.giftcode;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/giftcode", {
        pageTitle: "Giftcode",
        path: "/user/giftcode",
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    try {
      if (req.user.membershipType === "Premium") {
        return res.status(422).render("user/giftcode", {
          pageTitle: "Giftcode",
          path: "/user/giftcode",
          errorMessage: "You are already a Premium member!",
          validationErrors: [
            {
              path: "giftcode",
            },
          ],
        });
      }
      const giftcode = await Giftcode.findOne({ code: giftcodeValue });
      giftcode.isRedeemed = true;
      await giftcode.save();
      await req.user.upgradeAccount();
      req.flash("success", "Giftcode redeemed successfully!");
      return res.status(200).redirect("/user/profile");
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    }
  },
};

export default userController;
