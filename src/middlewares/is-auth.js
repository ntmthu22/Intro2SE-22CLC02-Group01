module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'You need to log in first to access this page');
    return res.redirect("/login");
  }
  next();
};
