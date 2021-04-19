const express = require('express');
const database_manager = require('../../../database/database-manager.js');
const passport = require('passport');
const passport_config = require('../../../modules/passport.js');
const router = express.Router();

passport_config.passport_config(passport);

router.get('/login', passport_config.already_auth, (req, res) => {
  const message = req.flash('error')[0];
  req.flash('error', message)
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash   : true
}));

module.exports = router;