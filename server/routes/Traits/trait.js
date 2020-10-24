const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router()

router.get('/trait', async (req, res) => {
  const traits = await database_manager.queryDatabase(`
    SELECT trait 
    FROM traits 
    ORDER BY trait ASC;`, {});

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

module.exports = router;