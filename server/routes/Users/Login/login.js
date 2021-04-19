const express = require('express');
const database_manager = require('../../../database/database-manager.js');
const passport = require('passport');
const passport_config = require('../../../modules/passport.js');
const router = express.Router();

passport_config.passport_config(passport);

router.get('/login', passport_config.already_auth, (req, res) => {
  res.render('login');
});

router.post('/login', passport_config.passport_config, async (req, res) => {

});

module.exports = router;