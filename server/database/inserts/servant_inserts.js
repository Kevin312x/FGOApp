const database_manager = require('../database-manager.js');
const fs = require('fs');

const run = async () => {
  // Reads from the json file containing all servant's information
  const raw_data = fs.readFileSync('../../../scraper/servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  // Retrieves the names of the servants
  const keys = Object.keys(servants);

  // Reads from the file and inserts each servants and their info in the database
  for(let i = 0; i < keys.length; ++i) {
    await insert_servant(keys[i], servants[keys[i]]);
    await insert_cards(servants[keys[i]]['ID'], servants[keys[i]]['Cards']);
    await insert_noble_phantasm(servants[keys[i]]['ID'], servants[keys[i]]['Noble Phantasm']);
    await insert_dialogue(servants[keys[i]]['ID'], servants[keys[i]]['Dialogues']);
    await insert_skills(servants[keys[i]]['ID'], servants[keys[i]]['Skills']);
    await insert_skill_materials(servants[keys[i]]['ID'], servants[keys[i]]['Skill Reinforcement']);
    await insert_asc_materials(servants[keys[i]]['ID'], servants[keys[i]]['Ascension Materials']);
    await insert_passive_skills(servants[keys[i]]['ID'], servants[keys[i]]['Passives']);
    await insert_traits(servants[keys[i]]['ID'], servants[keys[i]]['Traits']);
    await insert_images(servants[keys[i]]['ID'], servants[keys[i]]['Final Asc Path'], servants[keys[i]]['Icon Path']);
  }

  // Closes the connection to the database and terminates the program
  database_manager.end()
}

const insert_servant = async (servant_name, servant_info) => {
  let attribute = servant_info['Attribute'];
  let servant_class = servant_info['Class'];
  let status = '';

  // Status is an enum attribute in the database
  if(attribute == '') { attribute = 'None' }
  switch(servant_info['Status']) {
    case 'LOCKED':
      status = 'story';
    case 'Limited Servant':
      status = 'limited';
    case 'Event Servant':
      status = 'event';
    default:
      status = 'permanent';
  }

  if(servant_class.includes('Beast III')) { servant_class = servant_name; }

  await database_manager.queryDatabase(`
    INSERT INTO alignments 
    (alignment)
    VALUES (:alignment) 
    ON DUPLICATE KEY UPDATE 
    alignment = :alignment;`, 
  {
    alignment: servant_info['Alignment']
  });

  // Inserts the servant into the database along with all necessary information
  await database_manager.queryDatabase(`
    INSERT INTO servants 
    (servant_id, name, rarity, min_hp, min_atk, max_hp, 
      max_atk, cost_id, illustrator, gender, death_rate, 
      attribute_id, star_weight, alignment_id, class_id, 
      np_gain_atk, np_gain_def, status, voice_actor, star_gen) 
    WITH cost_id_cte AS (
      SELECT cost_id 
      FROM costs 
      WHERE cost = :cost
    ), 
    attribute_id_cte AS (
      SELECT attribute_id 
      FROM \`attributes\` 
      WHERE attribute = :attribute
    ), 
    class_id_cte AS (
      SELECT class_id 
      FROM classes 
      WHERE class_name = :class_name
    ), 
    alignment_id_cte AS (
      SELECT alignment_id 
      FROM alignments 
      WHERE alignment = :alignment
    )
    SELECT :servant_id, :name, :rarity, :min_hp, :min_atk, :max_hp, 
      :max_atk, cost_id_cte.cost_id, :illustrator, :gender, :death_rate, 
      attribute_id_cte.attribute_id, :star_weight, alignment_id_cte.alignment_id, class_id_cte.class_id, 
      :np_gain_atk, :np_gain_def, :status, :voice_actor, :star_gen 
    FROM cost_id_cte, attribute_id_cte, class_id_cte, alignment_id_cte 
    ON DUPLICATE KEY UPDATE 
    death_rate = :death_rate, 
    np_gain_atk = :np_gain_atk, 
    np_gain_def = :np_gain_def, 
    status = :status, 
    star_gen = :star_gen;`, 
    {
      servant_id:    servant_info['ID'], 
      name:          servant_name, 
      rarity:        servant_info['Rarity'], 
      min_hp:        servant_info['Min HP'], 
      min_atk:       servant_info['Min Atk'], 
      max_hp:        servant_info['Max HP'], 
      max_atk:       servant_info['Max Atk'], 
      cost:          servant_info['Cost'], 
      illustrator:   servant_info['Illustrator'], 
      gender:        servant_info['Gender'], 
      death_rate:    servant_info['Death Rate'], 
      attribute:     attribute, 
      star_weight:   servant_info['Star Absorbtion'], 
      alignment:     servant_info['Alignment'], 
      class_name:    servant_class, 
      np_gain_atk:   servant_info['NP Charge Atk'], 
      np_gain_def:   servant_info['NP Charge Def'], 
      status:        status, 
      voice_actor:   servant_info['Voice Actor'], 
      star_gen:      servant_info['Star Generation']
    });

  // Insert servant's stats into the database
  await database_manager.queryDatabase(`
    INSERT INTO \`servant stats\` 
    (servant_id, strength, endurance, agility, mana, luck, np) 
    VALUES (:servant_id, :strength, :endurance, :agility, :mana, :luck, :np) 
    ON DUPLICATE KEY UPDATE 
    strength = :strength, 
    endurance = :endurance, 
    agility = :agility, 
    mana = :mana, 
    luck = :luck, 
    np = :np;`, 
  {
    servant_id: servant_info['ID'],
    strength:   servant_info['Stats']['Strength'],
    endurance:  servant_info['Stats']['Endurance'],
    agility:    servant_info['Stats']['Agility'],
    mana:       servant_info['Stats']['Mana'],
    luck:       servant_info['Stats']['Luck'],
    np:         servant_info['Stats']['NP']
  });
}

const insert_cards = async (servant_id, servant_deck) => {
  for(let i = 0; i < 5; ++i) {
    let card_type;

    // Determines the card types of each deck
    switch(servant_deck[i]) {
      case 'B':
        card_type = 'Buster';
        break;
      case 'A':
        card_type = 'Arts';
        break;
      case 'Q':
        card_type = 'Quick';
        break;
      default:
        card_type = 'None';
        break;
    }

    // Each servant has a mix of five cards (Buster, Arts, Quick) with each
    // deck consisting of at least one of each card type
    database_manager.queryDatabase(`
      INSERT INTO decks 
      (servant_id, card_number, card_id) 
      WITH card_id_cte AS (
        SELECT card_id 
        FROM \`card types\` 
        WHERE card_type = :card_type
      )
      SELECT :servant_id, :card_number, card_id_cte.card_id 
      FROM card_id_cte 
      ON DUPLICATE KEY UPDATE 
      card_number = :card_number;`, 
    {
      servant_id:  servant_id,
      card_number: i+1,
      card_type:   card_type
    });
  }
}

const insert_noble_phantasm = async (servant_id, servant_info_np) => {
  // Each servant has a different np, so we need the key (np name)
  const np_keys = Object.keys(servant_info_np);

  for(let i = 0; i < np_keys.length; ++i) {
    np_name = np_keys[i];
    let card_type = servant_info_np[np_name]['Type'];

    // Some enemy only servant's, like Solomon, np card type cannot be determined 
    if(card_type == 'Missing') { card_type = 'None' }

    // Inserts the servant's noble phantasm into the database then retrieves the np_id
    await database_manager.queryDatabase(`
      INSERT INTO \`noble phantasms\` 
      (name, card_id, servant_id, effect, oc_effect, classification, \`rank\`) 
      WITH card_id_cte AS (
        SELECT card_id 
        FROM \`card types\` 
        WHERE card_type = :card_type
      )
      SELECT :name, card_id_Cte.card_id, :servant_id, :effect, :oc_effect, :classification, :np_rank 
      FROM card_id_cte 
      ON DUPLICATE KEY UPDATE 
      name = :name, 
      effect = :effect, 
      oc_effect = :oc_effect, 
      classification = :classification, 
      \`rank\` = :np_rank;`, 
    {
      name:           np_name, 
      card_type:      card_type, 
      servant_id:     servant_id,
      effect:         servant_info_np[np_name]['Effect'].join('\n').trim(),
      oc_effect:      servant_info_np[np_name]['OC Effect'].join('').trim(),
      classification: servant_info_np[np_name]['Classification'],
      np_rank:        servant_info_np[np_name]['Rank']
    });

    // Inserts the levels of the noble phantasms and their effects into the database
    const np_effect_keys = Object.keys(servant_info_np[np_name]['Modifiers']);
    for(let i = 0; i < np_effect_keys.length; ++i) {
      const np_upgrade_effect = np_effect_keys[i];
      const np_modifiers = servant_info_np[np_name]['Modifiers'][np_upgrade_effect];
      
      for(let j = 0; j < 5; ++j) {
        await database_manager.queryDatabase(`
          INSERT INTO \`noble phantasm levels\` 
          (np_id, np_modifier, np_effect_modifier, level) 
          WITH np_id_cte AS (
            SELECT np_id 
            FROM \`noble phantasms\` 
            WHERE name = :name AND servant_id = :servant_id AND \`rank\` = :rank
          )
          SELECT np_id_cte.np_id, :np_modifier, :np_effect_modifier, :level 
          FROM np_id_cte 
          ON DUPLICATE KEY UPDATE 
          np_modifier = :np_modifier, 
          np_effect_modifier = :np_effect_modifier, 
          level = :level;`,
        {
          name:               np_name, 
          servant_id:         servant_id, 
          rank:               servant_info_np[np_name]['Rank'],
          np_modifier:        np_modifiers[j],
          np_effect_modifier: np_upgrade_effect,
          level:              j+1
        });
      }
    }

    // Inserts the levels of the noble phantasms and their oc effects into the database
    const np_oc_effect_keys = Object.keys(servant_info_np[np_name]['OC']);
    for(let i = 0; i < np_oc_effect_keys.length; ++i) {
      const np_oc_upgrade_effect = np_oc_effect_keys[i];
      const oc_modifiers = servant_info_np[np_name]['OC'][np_oc_upgrade_effect];
      
      for(let j = 0; j < 5; ++j) {
        await database_manager.queryDatabase(`
          INSERT INTO \`noble phantasm oc levels\` 
          (np_id, oc_modifier, oc_effect_modifier, level) 
          WITH np_id_cte AS (
            SELECT np_id 
            FROM \`noble phantasms\` 
            WHERE name = :name AND servant_id = :servant_id AND \`rank\` = :rank
          )
          SELECT np_id_cte.np_id, :oc_modifier, :oc_effect_modifier, :level 
          FROM np_id_cte 
          ON DUPLICATE KEY UPDATE 
          oc_modifier = :oc_modifier, 
          oc_effect_modifier = :oc_effect_modifier, 
          level = :level;`, 
        {
          name :              np_name,
          servant_id:         servant_id, 
          rank:               servant_info_np[np_name]['Rank'], 
          oc_modifier:        oc_modifiers[j],
          oc_effect_modifier: np_oc_upgrade_effect,
          level:              j+1
        });
      }
    }
    
  }
}

const insert_dialogue = async (servant_id, servant_dialogues) => {
  const keys = Object.keys(servant_dialogues);

  // Inserts the servant's bond and other dialogues into the database
  for(let i = 0; i < keys.length; ++i) {
    await database_manager.queryDatabase(`
      INSERT INTO \`bond dialogues\` 
      (servant_id, bond_level, dialogue) 
      VALUES (:servant_id, :bond_level, :dialogue)
      ON DUPLICATE KEY UPDATE 
      bond_level = :bond_level, dialogue = :dialogue;`, 
      {
        servant_id: servant_id, 
        bond_level: keys[i], 
        dialogue:   servant_dialogues[keys[i]]
      });
  }
}

const insert_skills = async (servant_id, servant_skills) => {
  const servant_skill_keys = Object.keys(servant_skills);

  // Inserts the servant's skills and skill level modifiers into the database
  for(let i = 0; i < servant_skill_keys.length; ++i) {
    const skill_name = servant_skill_keys[i];
    const skill_rank = servant_skills[skill_name]['Rank'];
    const effect = servant_skills[skill_name]['Effects'].join('\n');
    const skill_number = servant_skills[skill_name]['Skill Number'];
    
    // Inserts servant's skills into the database
    database_manager.queryDatabase(`
      INSERT INTO \`servant skills\` 
      (servant_id, skill_name, skill_rank, effect, skill_number) 
      VALUES (:servant_id, :skill_name, :skill_rank, :effect, :skill_number) 
      ON DUPLICATE KEY UPDATE 
      skill_rank = :skill_rank, effect = :effect;`, 
      {
        servant_id:   servant_id,
        skill_name:   skill_name,
        skill_rank:   skill_rank,
        effect:       effect,
        skill_number: skill_number
      });

    const skill_up_keys = Object.keys(servant_skills[skill_name]['Skill Ups']);

    for(let j = 0; j < skill_up_keys.length; ++j) {
      const skill_up_modifiers = servant_skills[skill_name]['Skill Ups'][skill_up_keys[j]];
      let cooldown = servant_skills[skill_name]['Cooldown'].split('-')[1];
      
      if(skill_up_modifiers != undefined) {
        for(let k = 0; k < 10; ++k) {
          if(k + 1 == 6) { cooldown -= 1; }
          if(k + 1 == 10) { cooldown -= 1; }

          // Inserts servant's skill levels into database
          database_manager.queryDatabase(`
          INSERT INTO \`servant skill levels\` 
          (servant_skill_id, skill_level, modifier, cooldown, skill_up_effect) 
          WITH ssk_id_cte AS (
            SELECT servant_skill_id 
            FROM \`servant skills\` 
            WHERE servant_id = :servant_id AND skill_number = :skill_number
          )
          SELECT ssk_id_cte.servant_skill_id, :skill_level, :modifier, :cooldown, :skill_up_effect 
          FROM ssk_id_cte 
          ON DUPLICATE KEY UPDATE 
          modifier = :modifier, cooldown = :cooldown;`, 
          {
            servant_id:      servant_id,
            skill_number:    skill_number, 
            skill_level:     k+1,
            modifier:        skill_up_modifiers[k],
            cooldown:        cooldown,
            skill_up_effect: skill_up_keys[j]
          });
        }
      }
    }
  }
}

/**
 * Inserts materials required for skill ups into database
 * @param servant_id: id of the servant
 * @param skill_materials: object list of all materials and amounts for each skill up
 */
const insert_skill_materials = async (servant_id, skill_materials) => {
  const skill_keys = Object.keys(skill_materials)
  if(!skill_keys.length) { return; }

  for(let i = 0; i < skill_keys.length; ++i) {
    const skill_mat_names = Object.keys(skill_materials[skill_keys[i]]);

    for(let j = 0; j < skill_mat_names.length; ++j) {
      const material_name = skill_mat_names[j];
      let material_amt = skill_materials[skill_keys[i]][material_name]['Amount'];
      if(typeof material_amt == 'string') { material_amt = parseInt(material_amt.replace(/,/g, '')) }

      await database_manager.queryDatabase(`
        INSERT INTO \`servant skill materials\` 
        (servant_skill_levels_id, material_id, amount) 
        WITH mat_id_cte AS (
          SELECT material_id 
          FROM materials 
          WHERE name = :mat_name
        ), 
        sskl_id_cte AS (
          SELECT sskl.servant_skill_levels_id 
          FROM \`servant skill levels\` AS sskl 
          INNER JOIN \`servant skills\` AS ssk ON ssk.servant_skill_id = sskl.servant_skill_id 
          WHERE ssk.servant_id = :servant_id AND sskl.skill_level = :skill_level
        )
        SELECT sskl_id_cte.servant_skill_levels_id, mat_id_cte.material_id, :amount 
        FROM mat_id_cte, sskl_id_cte 
        ON DUPLICATE KEY UPDATE 
        amount = :amount;`, 
      {
        mat_name:    material_name, 
        servant_id:  servant_id,
        skill_level: i + 1,
        amount:      material_amt
      });
    }
  }
}

 /**
  * Inserts materials required for ascension into database
  * @param servant_id: id of the servant
  * @param ascension_materials: object list of all materials and amounts for each ascension
  */
const insert_asc_materials = async (servant_id, ascension_materials) => {
  const asc_keys = Object.keys(ascension_materials)
  if(!asc_keys.length) { return; }
  
  for(let i = 0; i < asc_keys.length; ++i) {
    const asc_mat_names = Object.keys(ascension_materials[asc_keys[i]]);
    await database_manager.queryDatabase(`
      INSERT INTO \`servant ascension\` 
      (servant_id, ascension) 
      VALUES (:servant_id, :ascension) 
      ON DUPLICATE KEY UPDATE 
      ascension = :ascension;`, 
    {
      servant_id: servant_id,
      ascension:  i + 1
    });

    for(let j = 0; j < asc_mat_names.length; ++j) {
      let material_name = asc_mat_names[j];
      let material_amt = ascension_materials[asc_keys[i]][material_name]['Amount'];
      if(typeof material_amt == 'string') { material_amt = parseInt(material_amt.replace(/,/g, '')) }

      // Edge case for material name, since it doesn't match
      switch(material_name) {
        case 'Fugaku Sanjūroppyō':
          material_name = 'Thirty-six Ice of Mount Fuji';
          break;
        default:
          break;
      }

      await database_manager.queryDatabase(`
        INSERT INTO \`servant ascension materials\` 
        (ascension_id, material_id, amount) 
        WITH asc_id_cte AS (
          SELECT ascension_id 
          FROM \`servant ascension\` 
          WHERE servant_id = :servant_id AND ascension = :ascension
        ), 
        mat_id_cte AS (
          SELECT material_id 
          FROM materials 
          WHERE name = :mat_name
        )
        SELECT asc_id_cte.ascension_id, mat_id_cte.material_id, :amount 
        FROM asc_id_cte, mat_id_cte 
        ON DUPLICATE KEY UPDATE 
        amount = :amount;`, 
      {
        ascension: i + 1,
        mat_name:  material_name,
        amount:    material_amt
      });
    }
  }
}

/**
 * Inserts all passive skills of the servant into database
 * @param servant_id: id of the servant
 * @param passive_skills: object list of passive skills of the servant
 */
const insert_passive_skills = async (servant_id, passive_skills) => {
  const ps_names = Object.keys(passive_skills);

  for(let i = 0; i < ps_names.length; ++i) {
    let effect = passive_skills[ps_names[i]]['Effect'].join('')

    // Removes the (Mental Debuffs: , , , ) substrings from effect
    if(effect.includes('Mental')) {
      const paren_open_pos = effect.indexOf('(');
      const paren_end_pos = effect.indexOf(')');
      effect = effect.slice(0, paren_open_pos) + effect.slice(paren_end_pos + 1)
    }

    // If not, add it into db table
    await database_manager.queryDatabase(`
      INSERT INTO passives 
      (passive) 
      VALUES (:passive) 
      ON DUPLICATE KEY UPDATE 
      passive = :passive;`, 
    {
      passive: ps_names[i]
    });

    // Inserts all the passive skills of the servants into the N-to-M table
    await database_manager.queryDatabase(`
      INSERT INTO \`passive skills\` 
      (servant_id, passive_id, \`rank\`) 
      WITH passive_cte AS (
        SELECT passive_id 
        FROM passives 
        WHERE passive = :passive
      )
      SELECT :servant_id, passive_cte.passive_id, :rank 
      FROM passive_cte 
      ON DUPLICATE KEY UPDATE 
      \`rank\` = :rank;`, 
    {
      servant_id: servant_id, 
      passive:    ps_names[i], 
      rank:       passive_skills[ps_names[i]]['Rank']
    });

    // Insert into passive effects into db
    await database_manager.queryDatabase(`
      INSERT INTO \`passive effects\` 
      (passive, \`rank\`, effect) 
      VALUES (:passive, :rank, :effect) 
      ON DUPLICATE KEY UPDATE 
      \`rank\` = :rank, 
      effect = :effect;`, 
    {
      passive: ps_names[i], 
      rank:    passive_skills[ps_names[i]]['Rank'], 
      effect:  effect
    });
  }
}

/**
 * Retrieves trait_id of trait to insert into servant traits
 * If trait doesn't exist, insert trait into database and retrieve trait id
 * @param servant_id: id of the servant
 * @param servant_traits: list of traits of given servant 
 */
const insert_traits = async (servant_id, servant_traits) => {

  for(let i = 0; i < servant_traits.length; ++i) {
    const trait = servant_traits[i];
    await database_manager.queryDatabase(`
      INSERT INTO \`traits\` 
      (trait) 
      VALUES (:trait) 
      ON DUPLICATE KEY UPDATE 
      trait = :trait;`, 
    {
      trait: trait
    });

    database_manager.queryDatabase(`
    INSERT INTO \`servant traits\` 
    (servant_id, trait_id) 
    WITH trait_id_cte AS (
      SELECT trait_id 
      FROM \`traits\` 
      WHERE trait LIKE :trait
    )
    SELECT :servant_id, trait_id_cte.trait_id 
    FROM trait_id_cte 
    ON DUPLICATE KEY UPDATE 
    trait_id = trait_id_cte.trait_id;`, 
    {
      servant_id: servant_id,
      trait:      trait
    });
  }
}

const insert_images = async (servant_id, image_path, icon_image_path) => {
  await database_manager.queryDatabase(`
    INSERT INTO images 
    (path) 
    VALUES (:image_path), (:icon_image_path) 
    AS new 
    ON DUPLICATE KEY UPDATE 
    path = new.path;`, 
  {
    image_path:      image_path, 
    icon_image_path: icon_image_path
  });

  await database_manager.queryDatabase(`
    INSERT INTO \`ascension images\` 
    (servant_id, image_id, ascension) 
    WITH image_id_cte AS (
      SELECT image_id 
      FROM images 
      WHERE path = :image_path
    ), 
    icon_image_id_cte AS (
      SELECT image_id 
      FROM images 
      WHERE path = :icon_image_path
    )
    SELECT * FROM (
      SELECT :servant_id servant_id, image_id_cte.image_id image_id, 4 ascension 
      FROM image_id_cte 
      UNION ALL 
      SELECT :servant_id servant_id, icon_image_id_cte.image_id image_id, 'icon' ascension 
      FROM icon_image_id_cte
    ) AS dt 
    ON DUPLICATE KEY UPDATE 
    ascension = dt.ascension;`, 
  {
    servant_id:      servant_id,
    image_path:      image_path, 
    icon_image_path: icon_image_path
  });
}

run()