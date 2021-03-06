const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();
const middleware = require('../middlewares.js');

router.get('/trait', async (req, res) => {
  const traits = await database_manager.queryDatabase(`
    SELECT servants.name, images.path, traits.trait 
    FROM servants 
    INNER JOIN \`servant traits\` AS st ON st.servant_id = servants.servant_id 
    INNER JOIN traits ON traits.trait_id = st.trait_id 
    INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
    INNER JOIN images ON images.image_id = ai.image_id 
    WHERE ai.ascension = 'icon' 
    ORDER BY traits.trait ASC;`, {});

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'traits': traits});
      return;
    case 'html':
      res.render('traits', {'traits': traits});
      return;
    default:
      break;
  }
  
  res.status(400).send('Bad Request');
});

router.get('/trait/:trait', async (req, res) => {
  const trait = req.params.trait.replace('_', ' ');
  
  const servant_list = await database_manager.queryDatabase(`
    SELECT servants.name, servants.rarity, servants.max_hp, servants.max_atk, images.path 
    FROM servants 
    INNER JOIN \`servant traits\` AS st ON st.servant_id = servants.servant_id 
    INNER JOIN traits ON traits.trait_id = st.trait_id 
    INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
    INNER JOIN images ON images.image_id = ai.image_id 
    WHERE traits.trait = :trait AND ai.ascension = '4';`, 
  {
    trait: trait
  });

  const servants = middleware.paginated_results(req, servant_list);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'trait': trait, 'servants': servants});
      return;
    case 'html':
      res.render('trait_servants', {'trait': trait, 'servants': servants});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;