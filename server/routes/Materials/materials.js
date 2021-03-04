const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();

router.get('/material', async (req, res) => {
  const mat_list = await database_manager.queryDatabase(`
    SELECT materials.material_id, materials.name, images.path 
    FROM materials 
    INNER JOIN images ON materials.image_id = images.image_id;
  `);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'materials': mat_list});
      return;
    case 'html':
      res.render('materials.ejs', {'materials': mat_list});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.get('/material/:name', async (req, res) => {
  const mat_name = req.params.name.replace('_', ' ');

  const mat_data = await database_manager.queryDatabase(`
    SELECT materials.material_id, materials.name, materials.description, images.path 
    FROM materials 
    INNER JOIN images ON materials.image_id = images.image_id 
    WHERE materials.name = :name;`, 
  {
    name: mat_name
  });

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'mat_data': mat_data});
      return;
    case 'html':
      res.render('material_profile.ejs', {'mat_data': mat_data});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;