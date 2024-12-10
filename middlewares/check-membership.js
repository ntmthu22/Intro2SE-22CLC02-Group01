export default async (req, res, next) => {
  try {
    await req.user.checkMembershipStatus();
    next();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
