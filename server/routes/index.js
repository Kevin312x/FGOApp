const express = require('express');
const router = express.Router();
const verify_user_mw = require('../modules/is_logged_in.js');

router.get('/', verify_user_mw.is_logged_in, (req, res) => {
  res.render('index');
});

module.exports = router;