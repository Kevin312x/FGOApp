const express = require('express');
const router = express.Router();

router.get('/SQCalculator', (req, res) => {
  res.render('sqcalc');
});

module.exports = router;