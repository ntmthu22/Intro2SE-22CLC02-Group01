export default (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.status(200).redirect("/");
  }
  next();
};
