const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();

router.get('/mystic_code', async (req, res) => {
  const mc_list = await database_manager.queryDatabase(`
    SELECT mc.mystic_code_id, mc.mystic_code, images.path 
    FROM \`mystic codes\` AS mc 
    INNER JOIN \`mystic code images\` AS mci ON mc.mystic_code_id = mci.mystic_code_id 
    INNER JOIN images ON mci.mc_image_id = images.image_id 
    ORDER BY mc.mystic_code_id ASC;`, {}
  );

  switch(req.accepts(['json', 'html'])){
    case 'json':
      res.send({'mystic_codes': mc_list});
      return;
    case 'html':
      res.render('mystic_codes', {'mystic_codes': mc_list});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.get('/mystic_code/:mystic_code', async (req, res) => {
  const mc_name = req.params.mystic_code.replace('_', ' ');

  const mc_data = await database_manager.queryDatabase(`
    SELECT mystic_code_id, mystic_code 
    FROM \`mystic codes\` AS mc 
    WHERE mystic_code = :mc_name;`, 
  {
    mc_name: mc_name
  });

  const mc_image_male = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`mystic code images\` AS mci ON mci.mc_image_id = images.image_id 
    INNER JOIN \`mystic codes\` AS mc ON mci.mystic_code_id = mc.mystic_code_id 
    WHERE mc.mystic_code = :mc_name AND mci.gender = :gender;`, 
  {
    mc_name: mc_name,
    gender: 'm'
  });

  const mc_image_female = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`mystic code images\` AS mci ON mci.mc_image_id = images.image_id 
    INNER JOIN \`mystic codes\` AS mc ON mci.mystic_code_id = mc.mystic_code_id 
    WHERE mc.mystic_code = :mc_name AND mci.gender = :gender;`, 
  {
    mc_name: mc_name,
    gender: 'f'
  });

  const mc_skill_data = await database_manager.queryDatabase(`
    SELECT mcs.skill_number, mcs.skill_name, mcs.effect 
    FROM \`mystic code skills\` AS mcs 
    INNER JOIN \`mystic codes\` AS mc ON mc.mystic_code_id = mcs.mystic_code_id 
    WHERE mc.mystic_code = :mc_name;`, 
  {
    mc_name: mc_name
  });

  const mc_skill_levels = await database_manager.queryDatabase(`
    SELECT mcsl.skill_number, mcsl.skill_level, mcsl.modifier, mcsl.cooldown, mcsl.skill_up_effect 
    FROM \`mystic code skill levels\` AS mcsl 
    INNER JOIN \`mystic codes\` AS mc ON mc.mystic_code_id = mcsl.mystic_code_id 
    WHERE mc.mystic_code = :mc_name 
    ORDER BY mcsl.skill_number, mcsl.skill_level;`, 
  {
    mc_name: mc_name
  });

  switch(req.accepts(['json', 'html'])){
    case 'json':
      res.send({
        'mc_data': mc_data,
        'mc_image_male': mc_image_male,
        'mc_image_female': mc_image_female,
        'mc_skill_data': mc_skill_data,
        'mc_skill_levels': mc_skill_levels
      });
      return;
    case 'html':
      res.render('mystic_code_profile', {
        'mc_data': mc_data,
        'mc_image_male': mc_image_male,
        'mc_image_female': mc_image_female,
        'mc_skill_data': mc_skill_data,
        'mc_skill_levels': mc_skill_levels
      });
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

module.exports = router;