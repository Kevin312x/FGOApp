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

  const user_servants = await database_manager.queryDatabase(`
    SELECT us.servants_id, servants.name, servants.rarity, us.level, us.skill_level_1, 
    us.skill_level_2, us.skill_level_3, us.np_level 
    FROM \`user servants\` AS us 
    INNER JOIN servants ON us.servant_id = servants.servant_id 
    INNER JOIN users ON us.user_id = users.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY servants.servant_id ASC, us.user_servant_id ASC;`, 
  {
    user_id: user_id
  });

  const user_craft_essences = await database.queryDatabase(`
    SELECT uce.ce_id, ce.name, ce.rarity, ce.effect, uce.level 
    FROM \`user craft essences\` AS uce 
    INNER JOIN \`craft essences\` AS ce ON uce.ce_id = ce.ce_id 
    INNER JOIN users ON uce.user_id = users.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY ce.ce_id ASC, uce.user_ce_id ASC;`, 
  {
    user_id: user_id
  });

  const user_command_codes = await database.queryDatabase(`
    SELECT ucc.cc_id, cc.name, cc.rarity, cc.effect 
    FROM \`user command codes\` AS ucc 
    INNER JOIN \`command codes\` AS cc ON ucc.cc_id = cc.cc_id 
    INNER JOIN users ON users.user_id = ucc.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY cc.cc_id ASC, ucc.user_cc_id ASC;`, 
  {
    user_id: user_id
  });

  const user_mystic_codes = await database.queryDatabase(`
    SELECT umc.mystic_code_id, mc.mystic_code, umc.level 
    FROM \`user mystic codes\` AS umc 
    INNER JOIN \`mystic codes\` AS mc ON mc.mystic_code_id = umc.mystic_code_id 
    INNER JOIN \`users\` ON user.user_id = umc.user_id 
    WHERE user.user_id = :user_id;`, 
  {
    user_id: user_id
  });

  const user_materials = await database.queryDatabase(`
    SELECT um.material_id, materials.name, materials.rarity, um.amount 
    FROM \`user materials\` AS um 
    INNER JOIN materials ON materials.material_id = um.material_id 
    INNER JOIN users ON um.user_id = users.user_id 
    WHERE users.user_id = :user_id;`, 
  {
    user_id: user_id
  });
  
  switch(req.accepts(['json', 'html'])) {
    case 'json':
      return;
    case 'html':
      res.status(200).render('user_profile', {
        user_info:           user_info, 
        user_servants:       user_servants,
        user_craft_essences: user_craft_essences, 
        user_command_codes:  user_command_codes, 
        user_mystic_codes:   user_mystic_codes, 
        user_materials:      user_materials
      });
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

router.put('/profile/update_fc', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const server = req.body.server;
  const fc_id = req.body.fc_id;

  switch(server) {
    case 'na':
      await database_manager.queryDatabase(`
        UPDATE users 
        SET friendcode_na = :friendcode 
        WHERE user_id = :user_id;`, 
      {
        user_id: user_id,
        friendcode: fc_id
      });
      res.status(200);
      return;
    case 'jp':
      await database_manager.queryDatabase(`
        UPDATE users 
        SET friendcode_jp = :friendcode 
        WHERE user_id = :user_id;`, 
      {
        user_id: user_id,
        friendcode: fc_id
      });
      res.status(200);
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

router.put('/profile/update_msg', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const msg = req.body.message;

  try {
    await database_manager.queryDatabase(`
      UPDATE \`user profiles\` 
      SET user_message = :user_message 
      WHERE user_id = :user_id;`, 
    {
      user_id: user_id, 
      user_message: msg
    });
  }
  catch(e) {
    error.message = 'Server Error';
    error.status = 500;
    next(error);
  }
});

module.exports = router;