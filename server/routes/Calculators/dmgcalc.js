const express = require('express');
const router = express.Router();
const database_manager = require('../../database/database-manager.js');

router.get('/DMGCalculator', async (req, res) => {
  const servants = await database_manager.queryDatabase(`
    SELECT servants.name, classes.class_name, servants.max_atk, npl.np_modifier 
    FROM servants 
    INNER JOIN classes ON servants.class_id = classes.class_id
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`noble phantasm levels\` AS npl ON np.np_id = npl.np_id
    WHERE effect LIKE '%Deals damage%' AND npl.np_modifier LIKE '%\%%' AND npl.level = 5 
    ORDER BY servants.servant_id ASC;`, []);
  res.render('dmgcalc', {servants: JSON.stringify(servants)});
});

module.exports = router;

/*
SELECT np.servant_id, npl.np_modifier 
FROM `noble phantasms` np 
INNER JOIN `noble phantasm levels` npl 
ON np.np_id = npl.np_id 
WHERE effect LIKE '%Deals damage%' AND npl.np_modifier LIKE '%\%%' AND npl.level = 5;
*/