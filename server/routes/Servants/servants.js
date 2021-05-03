const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router()
const middleware = require('../middlewares.js');

let query_results = false;

router.get('/servant/class/:class', async (req, res, next) => {
  const error = new Error;
  const servant_class = req.params.class;

  if(!query_results) {
    var servant_list = await database_manager.queryDatabase(`
      SELECT servants.servant_id, servants.name, servants.rarity, servants.max_hp, servants.max_atk, classes.class_name, images.path 
      FROM servants 
      INNER JOIN classes ON servants.class_id = classes.class_id 
      INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
      INNER JOIN images ON ai.image_id = images.image_id 
      WHERE ai.ascension = '4' 
      ORDER BY servants.servant_id ASC;`, {});
    query_results = servant_list
  } else { var servant_list = query_results; }

  const servants = servant_list.filter(servant => {
    switch(servant_class) {
      case 'All':
        return true;
      case 'Extra':
        if(['Alter Ego', 'Avenger', 'Foreigner', 'Moon Cancer', 'Ruler', 'Shielder'].includes(servant.class_name)) {
          return true;
        } else { break; }
      default:
        if(['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker', 'Alter Ego', 'Avenger', 'Foreigner', 'Moon Cancer', 'Ruler', 'Shielder'].includes(servant.class_name)) {
          return (servant.class_name == servant_class ? true : false);
        } else { break; }
    }

    return false;
  });

  const servants_filtered = middleware.paginated_results(req, servants);
  
  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'servants': servants});
      return;
    case 'html':
      res.render('servants', {'servants': servants_filtered, 'servant_class': servant_class});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

router.get('/servant/rarity/:rarity', async (req, res, next) => {
  const error = new Error;
  const rarity = req.params.rarity;

  const servant_list = await database_manager.queryDatabase(`
    SELECT servants.servant_id, servants.name, servants.rarity, servants.max_hp, servants.max_atk, classes.class_name, images.path 
    FROM servants 
    INNER JOIN classes ON classes.class_id = servants.class_id 
    INNER JOIN \`ascension images\` AS ai ON ai.servant_id = servants.servant_id 
    INNER JOIN images ON images.image_id = ai.image_id 
    WHERE servants.rarity = :rarity AND ai.ascension = '4';`, 
  {
    rarity: rarity
  });

  const servants = middleware.paginated_results(req, servant_list);

  switch(req.accepts(['json', 'html'])) {
    case 'json':
      res.send({'servants': servants, 'rarity': rarity});
      return;
    case 'html':
      res.render('servants_rarity', {'servants': servants, 'rarity': rarity});
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

router.get('/servant/:name(*)', async (req, res, next) => {
  const error = new Error;
  const servant_name = req.params.name.replace('_', ' ');
  
  const servant_data = await database_manager.queryDatabase(`
    SELECT servants.name, servants.rarity, servants.min_hp, servants.max_hp, 
      servants.min_atk, servants.max_atk, costs.cost, servants.illustrator, 
      servants.gender, servants.death_rate, attributes.attribute, classes.class_name, 
      servants.np_gain_atk, servants.np_gain_def, servants.status, servants.voice_actor, 
      servants.star_gen, servants.servant_id, servants.star_weight, alignments.alignment 
    FROM servants 
    INNER JOIN costs ON servants.cost_id = costs.cost_id 
    INNER JOIN attributes ON servants.attribute_id = attributes.attribute_id 
    INNER JOIN alignments ON servants.alignment_id = alignments.alignment_id 
    INNER JOIN classes ON servants.class_id = classes.class_id
    WHERE servants.name = :servant_name;`, {
      servant_name: servant_name
  });

  if(servant_data.length < 1) {
    error.message = 'Servant Not Found.';
    error.status = 404;
    next(error);
    return;
  }

  const servant_traits_data = await database_manager.queryDatabase(`
    SELECT trait 
    FROM traits 
    INNER JOIN \`servant traits\` AS st ON traits.trait_id = st.trait_id 
    INNER JOIN servants ON servants.servant_id = st.servant_id 
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });

  const servant_final_asc_img = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`ascension images\` AS ai ON images.image_id = ai.image_id 
    INNER JOIN servants ON ai.servant_id = servants.servant_id 
    WHERE servants.name = :servant_name AND ai.ascension = '4';`, 
  {
    servant_name: servant_name
  });

  const servant_icon_img = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`ascension images\` AS ai ON images.image_id = ai.image_id 
    INNER JOIN servants ON ai.servant_id = servants.servant_id 
    WHERE servants.name = :servant_name AND ai.ascension = 'icon';`, 
  {
    servant_name: servant_name
  });

  const servant_np_data = await database_manager.queryDatabase(`
    SELECT np.name, np.effect, np.oc_effect, card.card_type, np.classification, np.rank 
    FROM servants
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`card types\` AS card ON np.card_id = card.card_id
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });

  const servant_np_levels = await database_manager.queryDatabase(`
    SELECT DISTINCT npl.level, npl.np_modifier, npl.np_effect_modifier 
    FROM servants
    INNER JOIN \`noble phantasms\` AS np ON servants.servant_id = np.servant_id 
    INNER JOIN \`noble phantasm levels\` AS npl ON np.np_id = npl.np_id 
    WHERE servants.name = :servant_name 
    ORDER BY npl.level ASC;`, 
  {
    servant_name: servant_name
  });

  const servant_np_oc_levels = await database_manager.queryDatabase(`
    SELECT DISTINCT npoc.level, npoc.oc_modifier, npoc.oc_effect_modifier 
    FROM servants 
    INNER JOIN \`noble phantasms\` AS np ON  servants.servant_id = np.servant_id 
    INNER JOIN \`noble phantasm oc levels\` AS npoc ON np.np_id = npoc.np_id 
    WHERE servants.name = :servant_name 
    ORDER BY npoc.level ASC;`, 
  {
    servant_name: servant_name
  });

  const servant_card_data = await database_manager.queryDatabase(`
    SELECT card.card_type 
    FROM servants 
    INNER JOIN decks ON servants.servant_id = decks.servant_id 
    INNER JOIN \`card types\` AS card ON decks.card_id = card.card_id 
    WHERE servants.name = :servant_name 
    ORDER BY decks.card_number ASC;`, 
  {
    servant_name: servant_name
  });

  const servant_skill_data = await database_manager.queryDatabase(`
    SELECT sk.skill_number, sk.skill_name, sk.skill_rank, sk.effect 
    FROM \`servant skills\` AS sk 
    INNER JOIN servants ON servants.servant_id = sk.servant_id
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });

  const servant_skill_levels = await database_manager.queryDatabase(`
    SELECT sk.skill_number, skl.skill_level, skl.skill_up_effect, skl.modifier, skl.cooldown 
    FROM \`servant skill levels\` AS skl 
    INNER JOIN \`servant skills\` AS sk ON sk.servant_skill_id = skl.servant_skill_id 
    INNER JOIN servants ON servants.servant_id = sk.servant_id
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });

  const servant_stats_data = await database_manager.queryDatabase(`
    SELECT ss.strength, ss.endurance, ss.agility, ss.mana, ss.luck, ss.np 
    FROM \`servant stats\` ss 
    INNER JOIN servants ON servants.servant_id = ss.servant_id 
    WHERE servants.name = :servant_name`,
   {
     servant_name: servant_name
   });
  
  const class_dmg_mod = await database_manager.queryDatabase(`
    SELECT atk_modifier 
    FROM classes 
    INNER JOIN servants ON classes.class_id = servants.class_id 
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });

  const class_image_link = await database_manager.queryDatabase(`
    SELECT images.path 
    FROM images 
    INNER JOIN \`class images\` AS ci ON images.image_id = ci.image_id 
    INNER JOIN classes ON classes.class_id = ci.class_id 
    INNER JOIN servants ON servants.class_id = classes.class_id 
    WHERE servants.name = :servant_name;`, 
  {
    servant_name: servant_name
  });
  
  const servant_bond_dialogues = await database_manager.queryDatabase(`
    SELECT bd.bond_level, bd.dialogue 
    FROM \`bond dialogues\` AS bd 
    INNER JOIN servants ON servants.servant_id = bd.servant_id 
    WHERE servants.name = :servant_name 
    ORDER BY bond_id ASC;`, 
  {
    servant_name: servant_name
  });

  const servant_passive_skills = await database_manager.queryDatabase(`
    SELECT ps.rank, passives.passive, pe.effect 
    FROM \`passive skills\` AS ps 
    INNER JOIN passives ON ps.passive_id = passives.passive_id 
    INNER JOIN \`passive effects\` AS pe ON pe.passive = passives.passive 
    INNER JOIN servants ON servants.servant_id = ps.servant_id 
    WHERE servants.name = :servant_name AND ps.rank = pe.rank;`, 
  {
    servant_name: servant_name
  });

  const servant_skill_materials = await database_manager.queryDatabase(`
    SELECT sskl.skill_level, materials.material_id, materials.name, ssm.amount, images.path 
    FROM materials 
    INNER JOIN \`servant skill materials\` AS ssm ON materials.material_id = ssm.material_id 
    INNER JOIN \`servant skill levels\` AS sskl ON ssm.servant_skill_levels_id = sskl.servant_skill_levels_id 
    INNER JOIN \`servant skills\` AS ss ON sskl.servant_skill_id = ss.servant_skill_id 
    INNER JOIN servants ON ss.servant_id = servants.servant_id 
    INNER JOIN images ON materials.image_id = images.image_id 
    WHERE servants.name = :servant_name 
    ORDER BY sskl.skill_level, materials.material_id;`, 
  {
    servant_name: servant_name
  });

  const servant_asc_materials = await database_manager.queryDatabase(`
    SELECT sa.ascension, materials.material_id, materials.name, sam.amount, images.path 
    FROM materials 
    INNER JOIN \`servant ascension materials\` AS sam ON materials.material_id = sam.material_id 
    INNER JOIN \`servant ascension\` AS sa ON sam.ascension_id = sa.ascension_id 
    INNER JOIN servants ON sa.servant_id = servants.servant_id 
    INNER JOIN images ON materials.image_id = images.image_id 
    WHERE servants.name = :servant_name 
    ORDER BY sa.ascension, materials.material_id;`, 
  {
    servant_name: servant_name
  });
  
  const servant_total_materials = await database_manager.queryDatabase(`
    SELECT sum_table.material_id, sum_table.name, SUM(sum_table.amount) amount, images.path 
    FROM (
      SELECT materials.material_id, materials.name, (ssm.amount * 3) amount
      FROM materials 
      INNER JOIN \`servant skill materials\` AS ssm ON materials.material_id = ssm.material_id 
      INNER JOIN \`servant skill levels\` AS sskl ON ssm.servant_skill_levels_id = sskl.servant_skill_levels_id 
      INNER JOIN \`servant skills\` AS ss ON sskl.servant_skill_id = ss.servant_skill_id 
      INNER JOIN servants ON ss.servant_id = servants.servant_id 
      WHERE servants.name = :servant_name
      UNION ALL 
      SELECT materials.material_id, materials.name, sam.amount 
      FROM materials 
      INNER JOIN \`servant ascension materials\` AS sam ON materials.material_id = sam.material_id 
      INNER JOIN \`servant ascension\` AS sa ON sam.ascension_id = sa.ascension_id 
      INNER JOIN servants ON sa.servant_id = servants.servant_id 
      WHERE servants.name = :servant_name
    ) sum_table 
    INNER JOIN materials ON materials.material_id = sum_table.material_id 
    INNER JOIN images ON materials.image_id = images.image_id 
    GROUP BY 1 
    ORDER BY 1;`,
  {
    servant_name: servant_name
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
        'servant_final_asc_img': servant_final_asc_img,
        'servant_icon_img': servant_icon_img,
        'servant_skill_materials': servant_skill_materials,
        'servant_asc_materials': servant_asc_materials,
        'servant_total_materials': servant_total_materials
      });
      return;
    case 'html':
      res.render('servant_profile', {
        'servant_data': servant_data, 
        'servant_card_data': servant_card_data, 
        'servant_np_data': servant_np_data, 
        'servant_np_levels': servant_np_levels,
        'servant_np_oc_levels': servant_np_oc_levels,
        'servant_skill_data': servant_skill_data,
        'servant_skill_levels': servant_skill_levels,
        'servant_stats_data': servant_stats_data,
        'servant_class_dmg_mod': class_dmg_mod,
        'servant_final_asc_img': servant_final_asc_img,
        'servant_class_img': class_image_link,
        'servant_traits_data': servant_traits_data,
        'servant_bond_dialogues': servant_bond_dialogues,
        'servant_passive_skills': servant_passive_skills,
        'servant_icon_img': servant_icon_img,
        'servant_skill_materials': servant_skill_materials,
        'servant_asc_materials': servant_asc_materials,
        'servant_total_materials': servant_total_materials
      });
      return;
    default:
      break;
  }

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});

module.exports = router;