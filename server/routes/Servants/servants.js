const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router()

router.get('/servants/class/:class', async (req, res) => {
  const servant_class = req.params.class;
  let query_string = `
  SELECT servants.servant_id, servants.name, servants.rarity, classes.class_name, images.path 
  FROM servants 
  INNER JOIN classes ON servants.class_id = classes.class_id 
  INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
  INNER JOIN images ON ai.image_id = images.image_id `;

  if(servant_class == 'All') {}
  else if (servant_class == 'Extra') {
    query_string += ` WHERE classes.class_name = 'Alter Ego' OR classes.class_name = 'Foreigner' OR classes.class_name = 'Shielder' 
                    OR classes.class_name = 'Ruler' OR classes.class_name = 'Avenger' OR classes.class_name = 'Moon Cancer'`;
  } else { query_string += ` WHERE classes.class_name = '${servant_class}'`; }

  query_string += ` ORDER BY servants.name ASC;`;
  const servants = await database_manager.queryDatabase(query_string);
  
  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'servants': servants});
      return;
    case 'html':
      res.render('servants', {'servants': servants, 'servant_class': servant_class});
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.post('/servants/class/:class', (req, res) => {

});

router.get('/servants/id/:id', async (req, res) => {
  const servant_id = req.params.id;

  const servant_data = await database_manager.queryDatabase(`
    SELECT servants.name, servants.rarity, servants.min_hp, servants.max_hp, 
      servants.min_atk, servants.max_atk, costs.cost, servants.illustrator, 
      servants.gender, servants.death_rate, attributes.attribute, classes.class_name, 
      servants.np_gain_atk, servants.np_gain_def, servants.status, servants.voice_actor, 
      servants.star_gen 
    FROM servants 
    INNER JOIN costs ON servants.cost_id = costs.cost_id 
    INNER JOIN attributes ON servants.attribute_id = attributes.attribute_id 
    INNER JOIN classes ON servants.class_id = classes.class_id
    WHERE servant_id = :servant_id;`, {
      servant_id: servant_id
  });

  const servant_final_asc_img = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`ascension images\` AS ai ON images.image_id = ai.image_id 
    INNER JOIN servants ON ai.servant_id = servants.servant_id 
    WHERE servants.servant_id = :servant_id;`, 
  {
    servant_id: servant_id
  });

  const servant_np_data = await database_manager.queryDatabase(`
    SELECT np.name, np.effect, np.oc_effect, card.card_type
    FROM servants
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`card types\` AS card ON np.card_id = card.card_id
    WHERE servants.servant_id = :servant_id;`, 
  {
    servant_id: servant_id
  });

  const servant_np_levels = await database_manager.queryDatabase(`
    SELECT DISTINCT npl.level, npl.np_modifier, npl.oc_modifier 
    FROM servants
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`noble phantasm levels\` AS npl ON np.np_id = npl.np_id 
    WHERE servants.servant_id = :servant_id 
    ORDER BY npl.level ASC;`, 
  {
    servant_id: servant_id
  });

  const servant_card_data = await database_manager.queryDatabase(`
    SELECT card.card_type 
    FROM servants 
    INNER JOIN decks ON servants.servant_id = decks.servant_id 
    INNER JOIN \`card types\` AS card ON decks.card_id = card.card_id 
    WHERE servants.servant_id = :servant_id 
    ORDER BY decks.card_number ASC;`, 
  {
    servant_id: servant_id
  });

  const servant_skill_data = await database_manager.queryDatabase(`
    SELECT skill_number, skill_name, skill_rank, effect 
    FROM \`servant skills\` 
    WHERE servant_id = :servant_id;`, 
  {
    servant_id: servant_id
  });

  const servant_skill_levels = await database_manager.queryDatabase(`
    SELECT skill_number, skill_level, skill_up_effect, modifier, cooldown 
    FROM \`servant skill levels\` 
    WHERE servant_id = :servant_id;`, 
  {
    servant_id: servant_id
  });

  const servant_stats_data = await database_manager.queryDatabase(`
    SELECT ss.strength, ss.endurance, ss.agility, ss.mana, ss.luck, ss.np 
    FROM \`servant stats\` ss 
    WHERE servant_id = :servant_id`,
   {
     servant_id: servant_id
   });
  
  const class_dmg_mod = await database_manager.queryDatabase(`
    SELECT atk_modifier 
    FROM classes 
    INNER JOIN servants ON classes.class_id = servants.class_id 
    WHERE servants.servant_id = :servant_id;`, 
  {
    servant_id: servant_id
  });

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({
        'servant_data': servant_data, 
        'servant_card_data': servant_card_data, 
        'servant_np_data': servant_np_data, 
        'servant_np_levels': servant_np_levels,
        'servant_skill_data': servant_skill_data,
        'servant_skill_levels': servant_skill_levels,
        'servant_stats_data': servant_stats_data,
        'servant_class_dmg_mod': class_dmg_mod,
        'servant_final_asc_img': servant_final_asc_img
      });
      return;
    case 'html':
      res.render('servants', {
        'servant_data': servant_data, 
        'servant_card_data': servant_card_data, 
        'servant_np_data': servant_np_data, 
        'servant_np_levels': servant_np_levels,
        'servant_skill_data': servant_skill_data,
        'servant_skill_levels': servant_skill_levels,
        'servant_stats_data': servant_stats_data,
        'servant_class_dmg_mod': class_dmg_mod,
        'servant_final_asc_img': servant_final_asc_img
      });
      return;
    default:
      break;
  }

  res.status(400).send('Bad Request');
});

router.post('/servants/id/:id', (req, res) => {

});

module.exports = router;