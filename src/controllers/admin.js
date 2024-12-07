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
      path: "/user/edit-profile/name",
      originalName: req.user.name,
      username: req.user.name,
      errorMessage: null,
      validationErrors: [],
    });
  },
  getEditProfilePassword: (req, res) => {
    res.render("admin/edit-profile-password", {
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
};

export default adminController;
