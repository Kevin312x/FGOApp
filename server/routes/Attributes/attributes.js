const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();
const middleware = require('../middlewares.js');

router.get('/attribute', async (req, res) => {
  const attributes = await database_manager.queryDatabase(`
    SELECT * 
    FROM attributes 
    ORDER BY attribute_id;`, 
  {});

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'attributes': attributes});
      return;
    case 'html':
      res.render('attributes', {'attributes': attributes});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.get('/attribute/:attribute', async (req, res) => {
  const attribute = req.params.attribute;

  const servant_list = await database_manager.queryDatabase(`
    SELECT servants.servant_id, servants.name, servants.rarity, images.path 
    FROM servants 
    INNER JOIN attributes ON servants.attribute_id = attributes.attribute_id 
    INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
    INNER JOIN images ON ai.image_id = images.image_id 
    WHERE ai.ascension = '4' AND attributes.attribute = :attribute;`, 
  {
    attribute: attribute
  });

  const servants = middleware.paginated_results(req, servant_list);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'servants': servants});
      return;
    case 'html':
      res.render('attribute_servants', {'attribute': attribute, 'servants': servants});
      return;
    default:
      break;
  }

});

module.exports = router;