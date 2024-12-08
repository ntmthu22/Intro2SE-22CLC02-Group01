import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

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
  getManage: (req, res, next) => {
    res.render("admin/users", {
      pageTitle: "Users",
      path: "/admin/users",
    });
  },
};

export default adminController;
