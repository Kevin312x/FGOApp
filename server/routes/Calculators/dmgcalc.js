const express = require('express');
const router = express.Router();
const database_manager = require('../../database/database-manager.js');

router.get('/DMGCalculator', async (req, res) => {
  res.render('dmgcalc');
});

module.exports = router;