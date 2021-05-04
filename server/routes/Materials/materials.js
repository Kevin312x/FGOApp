const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();
const middleware = require('../middlewares.js');

router.get('/material', async (req, res) => {
  const error = new Error;
  const materials = await database_manager.queryDatabase(`
    SELECT materials.material_id, materials.name, materials.rarity, images.path 
    FROM materials 
    INNER JOIN images ON materials.image_id = images.image_id 
    ORDER BY materials.material_id ASC;
  `);

  const mat_list = middleware.paginated_results(req, materials);

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

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
  return;
});

router.get('/material/:name', async (req, res) => {
  const error = new Error;
  const mat_name = req.params.name.replace('_', ' ');

  const mat_data = await database_manager.queryDatabase(`
    SELECT materials.material_id, materials.name, materials.description, images.path 
    FROM materials 
    INNER JOIN images ON materials.image_id = images.image_id 
    WHERE materials.name = :name;`, 
  {
    name: mat_name
  });

  if(mat_data.length < 1) {
    error.message = 'Material Not Found.';
    error.status = 404;
    next(error);
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'mat_data': mat_data});
      return;
    case 'html':
      res.render('material_profile.ejs', {'material': mat_data});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
  return;
});

module.exports = router;