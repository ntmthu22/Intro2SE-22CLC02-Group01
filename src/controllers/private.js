exports.getSlash = (req, res, next) => {
  res.redirect("/dashboard");
};

exports.getDashboard = (req, res) => {
  res.render("dashboard", { pageTitle: "Dashboard" });
};
