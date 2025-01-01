export default (requiredRole) => {
  return (req, res, next) => {
    if (
      !req.session.isLoggedIn ||
      req.user.role.toLowerCase() !== requiredRole.toLowerCase()
    ) {
      req.flash("indexError", "You do not have access to this page.");
      return res.status(403).redirect("/");
    }
    next();
  };
};
