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
    SELECT us.user_servant_id, us.servant_id, servants.name, us.servant_atk, us.servant_hp, 
    servants.rarity, us.level, us.skill_level_1, us.skill_level_2, us.skill_level_3, us.np_level 
    FROM \`user servants\` AS us 
    INNER JOIN servants ON us.servant_id = servants.servant_id 
    INNER JOIN users ON us.user_id = users.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY servants.servant_id ASC, us.user_servant_id ASC;`, 
  {
    user_id: user_id
  });

  const user_craft_essences = await database_manager.queryDatabase(`
    SELECT uce.user_ce_id, uce.ce_id, ce.name, uce.ce_atk, uce.ce_hp, ce.rarity, uce.level, uce.limit_break, 
      IF(uce.limit_break = 5, ce.effect, ce.mlb_effect) as effect 
    FROM \`user craft essences\` AS uce 
    INNER JOIN \`craft essences\` AS ce ON uce.ce_id = ce.ce_id 
    INNER JOIN users ON uce.user_id = users.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY ce.ce_id ASC, uce.user_ce_id ASC;`, 
  {
    user_id: user_id
  });

  const user_command_codes = await database_manager.queryDatabase(`
    SELECT ucc.user_cc_id, ucc.cc_id, cc.name, cc.rarity, cc.effect 
    FROM \`user command codes\` AS ucc 
    INNER JOIN \`command codes\` AS cc ON ucc.cc_id = cc.code_id 
    INNER JOIN users ON users.user_id = ucc.user_id 
    WHERE users.user_id = :user_id 
    ORDER BY cc.code_id ASC, ucc.user_cc_id ASC;`, 
  {
    user_id: user_id
  });

  const user_mystic_codes = await database_manager.queryDatabase(`
    SELECT umc.mystic_code_id, mc.mystic_code, umc.level 
    FROM \`user mystic codes\` AS umc 
    INNER JOIN \`mystic codes\` AS mc ON mc.mystic_code_id = umc.mystic_code_id 
    INNER JOIN \`users\` ON users.user_id = umc.user_id 
    WHERE users.user_id = :user_id;`, 
  {
    user_id: user_id
  });

  const user_materials = await database_manager.queryDatabase(`
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
      res.status(200).send({
        user_info:           user_info, 
        user_servants:       user_servants,
        user_craft_essences: user_craft_essences, 
        user_command_codes:  user_command_codes, 
        user_mystic_codes:   user_mystic_codes, 
        user_materials:      user_materials
      });
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
  return;
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
      res.status(200).send({success: true});
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
      res.status(200).send({success: true});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
  return;
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
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.post('/profile/servant', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const servant_id = req.body.servant_id;
  const servant_level = req.body.servant_level;
  const servant_atk = req.body.servant_atk;
  const servant_hp = req.body.servant_hp;
  const servant_sk1 = req.body.servant_skill_level_1;
  const servant_sk2 = req.body.servant_skill_level_2;
  const servant_sk3 = req.body.servant_skill_level_3;
  const servant_np = req.body.servant_np_level;

  try {
    await database_manager.queryDatabase(`
      INSERT INTO \`user servants\` 
      (user_id, servant_id, servant_atk, servant_hp, level, skill_level_1, skill_level_2, skill_level_3, np_level) 
      VALUES (:user_id, :servant_id, :servant_atk, :servant_hp, :level, :skill_level_1, :skill_level_2, :skill_level_3, :np_level);`, 
    {
      user_id:       user_id,
      servant_id:    servant_id,
      servant_atk:   servant_atk,
      servant_hp:    servant_hp,
      level:         servant_level,
      skill_level_1: servant_sk1,
      skill_level_2: servant_sk2,
      skill_level_3: servant_sk3, 
      np_level:      servant_np
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.delete('/profile/servant', async (req, res, next) => {
  const error = new Error;
  const user_servant_id = req.body.user_servant_id;

  try {
    await database_manager.queryDatabase(`
      DELETE FROM \`user servants\` 
      WHERE user_servant_id = :user_servant_id;`, 
    {
      user_servant_id: user_servant_id
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.put('/profile/servant', async (req, res, next) => {

});

router.post('/profile/craft_essence', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const ce_id = req.body.ce_id;
  const level = req.body.level;
  const ce_atk = req.body.ce_atk;
  const ce_hp = req.body.ce_hp;
  const limit_break = req.body.limit_break;

  try {
    await database_manager.queryDatabase(`
      INSERT INTO \`user craft essences\` 
      (user_id, ce_id, level, ce_atk, ce_hp, limit_break) 
      VALUES (:user_id, :ce_id, :level, :ce_atk, :ce_hp, :limit_break)`, 
    {
      user_id:     user_id,
      ce_id:       ce_id,
      level:       level,
      ce_atk:      ce_atk,
      ce_hp:       ce_hp, 
      limit_break: limit_break
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.delete('/profile/craft_essence', async (req, res, next) => {
  const error = new Error;
  const user_ce_id = req.body.user_ce_id;

  try {
    await database_manager.queryDatabase(`
      DELETE FROM \`user craft essences\` 
      WHERE user_ce_id = :user_ce_id;`, 
    {
      user_ce_id: user_ce_id
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.put('/profile/craft_essence', async (req, res, next) => {

});

router.post('/profile/mystic_code', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const mc_id = req.body.mc_id;
  const level = req.body.level;

  try {
    await database_manager.queryDatabase(`
      INSERT INTO \`user mystic codes\` 
      (user_id, mystic_code_id, level) 
      VALUES (:user_id, :mystic_code_id, :level);`, 
    {
      user_id:        user_id,
      mystic_code_id: mc_id,
      level:          level
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.delete('/profile/mystic_code', async (req, res, next) => {
  const error = new Error;
  const user_id = req.user.user_id;
  const mc_id = req.user.mystic_code_id;

  try {
    await database_manager.queryDatabase(`
      DELETE FROM \`user mystic codes\` 
      WHERE user_id = :user_id AND mystic_code_id = :mc_id;`, 
    {
      user_id:        user_id,
      mystic_code_id: mc_id
    });
  } catch (err) {
    error.message = 'Internal Server Error';
    error.status = 500;
    next(error);
    return;
  }

  res.status(200).send({success: true});
  return;
});

router.put('/profile/mystic_code', async (req, res, next) => {

});

module.exports = router;