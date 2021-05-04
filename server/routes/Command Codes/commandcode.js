const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();
const middleware = require('../middlewares.js');

router.get('/command_code', async (req, res) => {
  const error = new Error;

  const cc_list = await database_manager.queryDatabase(`
    SELECT cc.code_id, cc.name, cc.rarity, images.path 
    FROM \`command codes\` AS cc 
    INNER JOIN \`command code images\` AS cci ON cci.code_id = cc.code_id 
    INNER JOIN images ON images.image_id = cci.image_id 
    ORDER BY code_id ASC;`, {});
  const cc_list_result = middleware.paginated_results(req, cc_list);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'cc_list': cc_list_result});
      return;
    case 'html':
      res.render('command_code', {'cc_list': cc_list_result});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
  return;
});

router.get('/command_code/:name', async (req, res) => {
  const error = new Error;
  const cc_name = req.params.name.replace('_', ' ');
  
  const cc_data = await database_manager.queryDatabase(`
    SELECT cc.code_id, cc.name, cc.rarity, cc.effect, cc.illustrator, cc.description, images.path 
    FROM \`command codes\` AS  cc 
    INNER JOIN \`command code images\` AS cci ON cci.code_id = cc.code_id 
    INNER JOIN images ON images.image_id = cci.image_id 
    WHERE cc.name = :name;`, 
  {
    name: cc_name
  });

  if(cc_data.length < 1) {
    error.message = 'Command Code Not Found.';
    error.status = 404;
    next(error);
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'cc_data': cc_data});
      return;
    case 'html':
      res.render('command_code_profile', {'cc_data': cc_data});
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