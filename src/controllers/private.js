exports.getDashboard = (req, res) => {
  if (req.session.isLoggedin) {
    res.render("dashboard", { pageTitle: "Dashboard" });
  } else {
    res.redirect("/login");
  }
};
