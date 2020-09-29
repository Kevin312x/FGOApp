const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();

const mc_list = database_manager.queryDatabase(`
  SELECT mc.mystic_code_id, mc.mystic_code, images.path 
  FROM \`mystic codes\` AS mc 
  INNER JOIN \`mystic code images\` AS mci ON mc.mystic_code_id = mci.mystic_code_id 
  INNER JOIN images ON mci.mc_image_id = images.image_id 
  ORDER BY mc.mystic_code_id ASC;`, {}
);

router.get('/mystic_code', (req, res) => {

  switch(req.accepts(['json', 'html'])){
    case 'json':
      res.send({'mystic_codes': mc_list});
      return;
    case 'html':
      res.render('mystic_codes', {'mystic_codes': mc_list});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;