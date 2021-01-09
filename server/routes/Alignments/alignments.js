const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router()
const middleware = require('../middlewares.js');

router.get('/alignment/', async (req, res) => {
  const alignments = await database_manager.queryDatabase(`
    SELECT * 
    FROM alignments 
    ORDER BY alignment_id;`, 
  {});

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'alignments': alignments});
      return;
    case 'html':
      res.render('alignments', {'alignments': alignments});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.get('/alignment/:alignment', async (req, res) => {
  const alignment = req.params.alignment.replace('_', ' ');

  const servant_list = await database_manager.queryDatabase(`
    SELECT servants.name, servants.rarity, servants.max_hp, servants.max_atk, images.path 
    FROM servants 
    INNER JOIN alignments on alignments.alignment_id = servants.alignment_id 
    INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
    INNER JOIN images ON ai.image_id = images.image_id 
    WHERE alignments.alignment = :alignment AND ai.ascension = '4';`, 
  {
    alignment: alignment
  });

  const servants = middleware.paginated_results(req, servant_list);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'alignments': alignment});
      return;
    case 'html':
      res.render('alignment_servants', {'servants': servants, 'alignment': alignment});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;