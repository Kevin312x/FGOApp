const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();

router.get('/craft_essence/:name', async (req, res) => {
  const ce_name = req.params.name;

  const ce_data = await database_manager.queryDatabase(`
    SELECT ce.ce_id, ce.name, ce.min_hp, ce.max_hp, ce.min_atk, ce.max_atk, ce.rarity, 
           ce.effect, ce.mlb_effect, ce.illustrator, ce.description, costs.cost 
    FROM \`craft essences\` AS ce 
    INNER JOIN costs ON costs.cost_id = ce.cost_id 
    WHERE ce.name = :name;`, 
  {
    name: ce_name
  });

  const ce_img_path = await database_manager.queryDatabase(`
    SELECT images.path FROM images 
    INNER JOIN \`craft essence images\` AS cei ON cei.image_id = images.image_id 
    INNER JOIN \`craft essences\` AS ce ON ce.ce_id = cei.ce_id 
    WHERE ce.name = :name;`, 
  {
    name: ce_name
  });

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({
        'ce_data': ce_data,
        'ce_img_path': ce_img_path
      });
      return;
    case 'html':
      res.render('craft_essence', {
        'ce_data': ce_data,
        'ce_img_path': ce_img_path
      });
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;