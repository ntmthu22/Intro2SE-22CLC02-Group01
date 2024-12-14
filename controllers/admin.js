import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Log from "../models/log.js";
import Product from "../models/product.js";
import {
  extractLocalDateAndTime,
  extractLocalDate,
  extractDateAndName,
} from "../utils/time.js";

const USERS_PER_PAGE = 3;
const ITEMS_PER_PAGE = 6;

const adminController = {
  getProfile: (req, res, next) => {
    res.render("admin/profile", {
      pageTitle: "Admin Profile",
      path: "/admin/profile",
      user: req.user,
    });
  },
  getEditProfile: (req, res, next) => {
    let successMessage = req.flash("success");

    if (successMessage.length > 0) {
      successMessage = successMessage[0];
    } else {
      successMessage = null;
    }

    res.render("admin/edit-profile", {
      pageTitle: "Edit Profile",
      path: "/admin/edit-profile",
      username: req.user.name,
      successMessage: successMessage,
    });
  },
  getEditProfileName: (req, res, next) => {
    res.render("admin/edit-profile-name", {
      pageTitle: "Edit Name",
      path: "/admin/edit-profile/name",
      originalName: req.user.name,
      username: req.user.name,
      errorMessage: null,
      validationErrors: [],
    });
  },
  postEditProfileName: (req, res, next) => {
    const name = req.body.name;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-profile-name", {
        pageTitle: "Edit Name",
        path: "/admin/edit-profile/name",
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
        res.status(200).redirect("/admin/edit-profile");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },

  getEditProfilePassword: (req, res) => {
    res.render("admin/edit-profile-password", {
      pageTitle: "Edit Password",
      path: "/admin/edit-profile/password",
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
      return res.status(422).render("admin/edit-profile-password", {
        pageTitle: "Edit Password",
        path: "/admin/edit-profile/password",
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
      res.status(200).redirect("/admin/edit-profile");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
  getManage: async (req, res, next) => {
    const page = +req.query.page || 1;
    let totalUsers;

    try {
      totalUsers = await User.find({ role: { $ne: "Admin" } }).countDocuments();

      if (page > Math.ceil(totalUsers / USERS_PER_PAGE) || page < 1) {
        return res.redirect(`/admin/users?page=${Math.max(page - 1, 1)}`);
      }

      const users = await User.find({ role: { $ne: "Admin" } })
        .skip((page - 1) * USERS_PER_PAGE)
        .limit(USERS_PER_PAGE);

      res.render("admin/users", {
        pageTitle: "Users",
        path: "/admin/users",
        users: users,
        currentPage: page,
        hasNextPage: USERS_PER_PAGE * page < totalUsers,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalUsers / USERS_PER_PAGE),
      });
    } catch (err) {
      const error = new Error(err.message || "Internal server error");
      error.statusCode = 500;
      next(error);
    }
  },
  disableAccount: async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      user.status = "disabled";
      await user.save();

      return res.status(200).json({ message: "Account disabled!" });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  restoreAccount: async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      user.status = "active";
      await user.save();

      return res.status(200).json({ message: "Account restored!" });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  getUserDetail: async (req, res, next) => {
    const userId = req.params.userId;

    if (userId === req.user._id.toString()) {
      return res.status(403).redirect("/admin/users");
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      const now = new Date();
      const currentYear = Number(now.getFullYear());
      const currentMonth = Number(now.getMonth() + 1);

      const monthlyLog = await Log.findOne({
        userId: userId,
        year: currentYear,
        month: currentMonth,
      });

      const expiredDate = user.validUntil
        ? extractLocalDateAndTime(user.validUntil)
        : null;
      const createdAt = extractLocalDateAndTime(user.createdAt);

      res.render("admin/user-detail", {
        pageTitle: "User Detail",
        path: "/admin/user-detail",
        user: user,
        expiredDate: expiredDate,
        createdAt: createdAt,
        monthlyCount: monthlyLog ? monthlyLog.count : 0,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500; // INTERAL SERVER $RROR
      }
      next(err);
    }
  },
  getUserActivities: async (req, res, next) => {
    const userId = req.params.userId;

    if (userId === req.user._id.toString()) {
      return res.status(403).redirect("/admin/users");
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      const logs = await Log.find({ userId: userId });

      let groupedLogs = {};

      if (logs.length > 0) {
        logs.forEach((log) => {
          const year = log.year;
          const month = log.month;

          if (!groupedLogs[year]) {
            groupedLogs[year] = {};
          }
          groupedLogs[year][month] = log.count;
        });
      }

      const loginAttempts = user.loginTimestamps.filter((login) => {
        return new Date() - login <= 7 * 24 * 60 * 60 * 1000;
      });

      const loginStatisticsMap = new Map();

      loginAttempts.forEach((attempt) => {
        const dateKey = extractLocalDate(attempt);

        if (!loginStatisticsMap.has(dateKey)) {
          loginStatisticsMap.set(dateKey, 1); // Initialize with 1 login
        } else {
          loginStatisticsMap.set(dateKey, loginStatisticsMap.get(dateKey) + 1); // Increment count
        }
      });

      const loginLabels = [];
      const loginData = [];

      loginStatisticsMap.forEach((value, key) => {
        loginLabels.push(key);
        loginData.push(value);
      });

      res.render("admin/user-activities", {
        pageTitle: "User Activities",
        path: "/admin/user-activities",
        groupedLogs: JSON.stringify(groupedLogs),
        loginLabels: JSON.stringify(loginLabels),
        loginData: JSON.stringify(loginData),
        user: user,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  },
  getUserAlbum: (req, res, next) => {
    const userId = req.params.userId;
    const username = req.query.username;
    const page = +req.query.page || 1;

    let totalItems;

    Product.find({ userId: userId })
      .countDocuments()
      .then((numProducts) => {
        totalItems = numProducts;
        return Product.find({ userId: userId })
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
          pageTitle: `User Album`,
          path: `/admin/users/${userId}/album`,
          username: username,
          prods: updatedProducts,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          viewAsAdmin: true,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  getUserProduct: (req, res, next) => {
    const { productId } = req.params;
    const { username } = req.query;

    Product.findOne({ _id: productId })
      .then((product) => {
        const { date, name } = extractDateAndName(product.originalImageUrl);
        res.render("album/product-detail", {
          pageTitle: "Product Detail",
          path: "/admin/user-product/",
          username: username,
          product: product,
          date: date,
          name: name,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  getRecent: async (req, res, next) => {},
  getOverall: async (req, res, next) => {
    const allUsers = await User.find({ role: { $ne: "Admin" } });

    const numberOfUsers = allUsers.length;

    const activeUserCount = allUsers.reduce((count, user) => {
      return user.status === "active" ? count + 1 : count;
    }, 0);

    const premiumUserCount = allUsers.reduce((count, user) => {
      return user.membershipType === "Premium" ? count + 1 : count;
    }, 0);

    res.render("admin/overall", {
      pageTitle: "Overall",
      path: "/admin/overall",
      totalUser: numberOfUsers,
      activeUserPercentage:
        numberOfUsers > 0
          ? (activeUserCount / numberOfUsers).toFixed(2) * 100
          : 0,
      premiumUsers: premiumUserCount,
      freeUsers: numberOfUsers - premiumUserCount,
    });
  },
};

export default adminController;
