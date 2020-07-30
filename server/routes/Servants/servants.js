const express = require('express');
const database_manager = require('../../database/database-manager.js');
const { query } = require('express');
const router = express.Router()

router.get('/servants/class/:class', async (req, res) => {
  const servant_class = req.params.class;
  let query_string = `
  SELECT servants.servant_id, servants.name, classes.class_name 
  FROM servants 
  INNER JOIN classes ON servants.class_id = classes.class_id`;

  if(servant_class == 'All') {}
  else if (servant_class == 'Extra') {
    query_string += ` WHERE classes.class_name = 'Alter Ego' OR classes.class_name = 'Foreigner' OR classes.class_name = 'Shielder' 
                    OR classes.class_name = 'Ruler' OR classes.class_name = 'Avenger' OR classes.class_name = 'Moon Cancer'`;
  } else { query_string += ` WHERE classes.class_name = '${servant_class}'`; }

  query_string += ` ORDER BY servants.name ASC;`;
  const servants = await database_manager.queryDatabase(query_string);
  
  res.send(servants)
});

router.post('/servants/class/:class', (req, res) => {

});

router.get('/servants/id/:id', async (req, res) => {
  const servant_id = req.params.id;

  const servant_data = await database_manager.queryDatabase(`
    SELECT * FROM servants WHERE servant_id = :servant_id;`, {
      servant_id: servant_id
    });

  const servant_np_data = await database_manager.queryDatabase(`
    SELECT npl.np_modifier, npl.level 
    FROM servants
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`noble phantasm levels\` AS npl ON np.np_id = npl.np_id 
    WHERE servants.servant_id = :servant_id 
    ORDER BY npl.level ASC;`, 
    {
      servant_id: servant_id
    });
  
  res.send({'servant_data': servant_data, 'servant_np_data': servant_np_data});
});

router.post('/servants/id/:id', (req, res) => {

});

module.exports = router;