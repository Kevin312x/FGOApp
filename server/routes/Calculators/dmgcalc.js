const express = require('express');
const router = express.Router();
const database_manager = require('../../database/database-manager.js');

router.get('/DMGCalculator', async (req, res) => {
  const servants = await database_manager.queryDatabase(`
  SELECT servants.name, classes.class_name 
  FROM servants 
  INNER JOIN classes ON servants.class_id = classes.class_id
  ORDER BY servants.servant_id ASC;`, []);

  res.render('dmgcalc', {servants: JSON.stringify(servants)});
});

module.exports = router;