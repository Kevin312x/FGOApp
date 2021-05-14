const express = require('express');
const router = express.Router();
const database_manager = require('../../../database/database-manager.js');

router.get('/profile', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  
  const user_info = await database_manager.queryDatabase(`
    SELECT users.username, users.friendcode_na, users.friendcode_jp, users.join_date, 
    user_profile.user_profile_picture, user_profile.user_message 
    FROM users 
    INNER JOIN \`user profiles\` AS user_profile ON users.user_id = user_profile.user_id 
    WHERE users.user_id = :user_id;`, 
  {
    user_id: user_id
  });
  user_info[0].join_date = user_info[0].join_date.toString().substring(4, 15);
  
  switch(req.accepts(['json', 'html'])) {
    case 'json':
      return;
    case 'html':
      res.status(200).render('user_profile', {user_info: user_info});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

module.exports = router;