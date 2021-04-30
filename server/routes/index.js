const express = require('express');
const router = express.Router();
const verify_user_mw = require('../modules/is_logged_in.js');

router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;