const express = require('express');
const router = express.Router();
const passport = require('passport');
const passport_config = require('../../../modules/passport.js');
passport_config.passport_config(passport);

router.get('/signout', passport_config.check_auth, (req, res, next) => {
  req.session.destroy((err) => {
    req.logout();
    return res.status(200).redirect('/');
  });
});

module.exports = router;