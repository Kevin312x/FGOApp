const express = require('express');
const router = express.Router();

router.get('/DMGCalculator', (req, res) => {
  res.render('dmgcalc');
});

module.exports = router;