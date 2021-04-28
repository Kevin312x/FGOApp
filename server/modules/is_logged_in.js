function is_logged_in(req, res, next) {
  res.locals.is_logged_in = (req.user ? true : false);
  next();
}

module.exports.is_logged_in = is_logged_in;