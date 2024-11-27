export default (req, res, next) => {
  if (!req.session.isLoggedIn || req.user.role.toLowerCase() !== "user") {
    req.flash("indexError", "You don't have access to this page.");
    return res.status(403).redirect("/");
  }
  next();
};
