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

  // Retireves the cost_id from the given cost
  const cost_id = await database_manager.queryDatabase(`SELECT cost_id FROM costs WHERE cost = ?;`, [servant_info['Cost']]);
  // Retrieves the attribute_id from the given attribute
  const attribute_id = await database_manager.queryDatabase(`SELECT attribute_id FROM \`attributes\` WHERE attribute = ?;`, [attribute]);
  // Retrieves the alignment_id from the given alignment
  let alignment_id = await database_manager.queryDatabase(`SELECT alignment_id FROM alignments WHERE alignment = ?;`, [servant_info['Alignment']]);
  // Retrieves the class_id from the givern class
  const class_id = await database_manager.queryDatabase(`SELECT class_id FROM classes WHERE class_name = ?;`, [servant_class]);
  
  // If alignment doesn't exist, insert the alignment into the database and then retrieve the alignment_id
  if(alignment_id.length == 0) { await database_manager.queryDatabase(`INSERT INTO alignments (alignment) VALUES (?);`, [servant_info['Alignment']]); }
  alignment_id = await database_manager.queryDatabase(`SELECT alignment_id FROM alignments WHERE alignment = ?;`, [servant_info['Alignment']]);

  // Inserts the servant into the database along with all necessary information
  await database_manager.queryDatabase(`INSERT INTO servants 
    (servant_id, name, rarity, min_hp, min_atk, max_hp, 
      max_atk, cost_id, illustrator, gender, death_rate, 
      attribute_id, star_weight, alignment_id, class_id, 
      np_gain_atk, np_gain_def, status, voice_actor, star_gen) 
    VALUES (:servant_id, :name, :rarity, :min_hp, :min_atk, :max_hp, 
      :max_atk, :cost_id, :illustrator, :gender, :death_rate, 
      :attribute_id, :star_weight, :alignment_id, :class_id, 
      :np_gain_atk, :np_gain_def, :status, :voice_actor, :star_gen) 
    ON DUPLICATE KEY UPDATE servant_id = :servant_id;`, 
    {
      servant_id:    servant_info['ID'], 
      name:          servant_name, 
      rarity:        servant_info['Rarity'], 
      min_hp:        servant_info['Min HP'], 
      min_atk:       servant_info['Min Atk'], 
      max_hp:        servant_info['Max HP'], 
      max_atk:       servant_info['Max Atk'], 
      cost_id:       cost_id[0]['cost_id'], 
      illustrator:   servant_info['Illustrator'], 
      gender:        servant_info['Gender'], 
      death_rate:    servant_info['Death Rate'], 
      attribute_id:  attribute_id[0]['attribute_id'], 
      star_weight:   servant_info['Star Absorbtion'], 
      alignment_id:  alignment_id[0]['alignment_id'], 
      class_id:      class_id[0]['class_id'], 
      np_gain_atk:   servant_info['NP Charge Atk'], 
      np_gain_def:   servant_info['NP Charge Def'], 
      status:        status, 
      voice_actor:   servant_info['Voice Actor'], 
      star_gen:      servant_info['Star Generation']
    });

  // Insert servant's stats into the database
  await database_manager.queryDatabase(`INSERT INTO \`servant stats\` (servant_id, strength, endurance, agility, mana, luck, np) 
    VALUES (?, ?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE servant_id = ?;`, 
    [servant_info['ID'], servant_info['Stats']['Strength'], servant_info['Stats']['Endurance'], servant_info['Stats']['Agility'], 
     servant_info['Stats']['Mana'], servant_info['Stats']['Luck'], servant_info['Stats']['NP'], servant_info['ID']]);
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
    
    // Select the card_id of each card type
    const card_id = await database_manager.queryDatabase(`
      SELECT card_id FROM \`card types\` 
      WHERE card_type = :card_type;`, 
    {
      card_type: card_type
    });

    // Each servant has a mix of five cards (Buster, Arts, Quick) with each
    // deck consisting of at least one of each card type
    database_manager.queryDatabase(`
      INSERT INTO decks 
      (servant_id, card_number, card_id) 
      VALUES (:servant_id, :card_number, :card_id) 
      ON DUPLICATE KEY UPDATE card_id = :card_id;`, 
    {
      servant_id: servant_id,
      card_number: i+1,
      card_id: card_id[0]['card_id']
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

    // Retrieves the card_id from the given card type
    const card_id = await database_manager.queryDatabase(`SELECT card_id FROM \`card types\` WHERE card_type = ?;`, [card_type]);

    // Inserts the servant's noble phantasm into the database then retrieves the np_id
    await database_manager.queryDatabase(`INSERT INTO \`noble phantasms\` 
      (name, card_id, servant_id, effect, oc_effect, classification, \`rank\`) 
      VALUES (:name, :card_id, :servant_id, :effect, :oc_effect, :classification, :np_rank) 
      ON DUPLICATE KEY UPDATE 
      effect = :effect, 
      oc_effect = :oc_effect, 
      classification = :classification;`, 
    {
      name: np_name, 
      card_id: card_id[0]['card_id'], 
      servant_id: servant_id,
      effect: servant_info_np[np_name]['Effect'].join('\n').trim(),
      oc_effect: servant_info_np[np_name]['OC Effect'].join('').trim(),
      classification: servant_info_np[np_name]['Classification'],
      np_rank: servant_info_np[np_name]['Rank']
    });

    np_id = await database_manager.queryDatabase(`SELECT np_id FROM \`noble phantasms\` ORDER BY np_id DESC LIMIT 1;`, []);

    // Inserts the levels of the noble phantasms and their effects into the database
    const np_effect_keys = Object.keys(servant_info_np[np_name]['Modifiers']);
    for(let i = 0; i < np_effect_keys.length; ++i) {
      const np_upgrade_effect = np_effect_keys[i];
      const np_modifiers = servant_info_np[np_name]['Modifiers'][np_upgrade_effect];
      
      for(let j = 0; j < 5; ++j) {
        await database_manager.queryDatabase(`INSERT INTO \`noble phantasm levels\` 
          (np_id, np_modifier, np_effect_modifier, level) 
          VALUES (:np_id, :np_modifier, :np_effect_modifier, :level)
          ON DUPLICATE KEY UPDATE 
          np_modifier = :np_modifier;`,
        {
          np_id: np_id[0]['np_id'],
          np_modifier: np_modifiers[j],
          np_effect_modifier: np_upgrade_effect,
          level: j+1
        });
      }
    }

    // Inserts the levels of the noble phantasms and their oc effects into the database
    const np_oc_effect_keys = Object.keys(servant_info_np[np_name]['OC']);
    for(let i = 0; i < np_oc_effect_keys.length; ++i) {
      const np_oc_upgrade_effect = np_oc_effect_keys[i];
      const oc_modifiers = servant_info_np[np_name]['OC'][np_oc_upgrade_effect];
      
      for(let j = 0; j < 5; ++j) {
        await database_manager.queryDatabase(`INSERT INTO \`noble phantasm oc levels\` 
          (np_id, oc_modifier, oc_effect_modifier, level) 
          VALUES (:np_id, :oc_modifier, :oc_effect_modifier, :level) 
          ON DUPLICATE KEY UPDATE 
          oc_modifier = :oc_modifier;`, 
        {
          np_id: np_id[0]['np_id'],
          oc_modifier: oc_modifiers[j],
          oc_effect_modifier: np_oc_upgrade_effect,
          level: j+1
        });
      }
    }
    
  }
}

const insert_dialogue = async (servant_id, servant_dialogues) => {
  const keys = Object.keys(servant_dialogues);

  // Inserts the servant's bond and other dialogues into the database
  for(let i = 0; i < keys.length; ++i) {
    await database_manager.queryDatabase(`INSERT INTO \`bond dialogues\` (servant_id, bond_level, dialogue) 
      VALUES (:servant_id, :bond_level, :dialogue)
      ON DUPLICATE KEY UPDATE bond_level = :bond_level, dialogue = :dialogue;`, 
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

    const last_servant_skill_id = await database_manager.queryDatabase(`
      SELECT servant_skill_id
      FROM \`servant skills\` 
      WHERE servant_id = :servant_id AND skill_number = :skill_number;`, 
      {
        servant_id: servant_id,
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
          database_manager.queryDatabase(`INSERT INTO \`servant skill levels\` 
          (servant_skill_id, skill_level, modifier, cooldown, skill_up_effect) 
          VALUES (:servant_skill_id, :skill_level, :modifier, :cooldown, :skill_up_effect) 
          ON DUPLICATE KEY UPDATE
          modifier = :modifier, cooldown = :cooldown;`, 
          {
            servant_skill_id: last_servant_skill_id[0]['servant_skill_id'],
            skill_level:      k+1,
            modifier:         skill_up_modifiers[k],
            cooldown:         cooldown,
            skill_up_effect:  skill_up_keys[j]
          });
        }
      }
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

    // Retrieves passive_id using passive name as param
    let passive_id = await database_manager.queryDatabase(`
      SELECT passives.passive_id 
      FROM passives 
      WHERE passive = :passive;`, 
    {
      passive: ps_names[i]
    });

    // Checks if passive name is recorded into the db
    if(passive_id.length == 0) {
      // If not, add it into db table
      await database_manager.queryDatabase(`
        INSERT INTO passives 
        (passive) 
        VALUES (:passive);`, 
      {
        passive: ps_names[i]
      });

      // Then get the passive_id
      passive_id = await database_manager.queryDatabase(`
        SELECT passives.passive_id 
        FROM passives 
        WHERE passive = :passive;`, 
      {
        passive: ps_names[i]
      });
    }

    // Inserts all the passive skills of the servants into the N-to-M table
    await database_manager.queryDatabase(`
      INSERT INTO \`passive skills\` 
      (servant_id, passive_id, \`rank\`) 
      VALUES (:servant_id, :passive_id, :rank) 
      ON DUPLICATE KEY UPDATE 
      servant_id = :servant_id, 
      passive_id = :passive_id, 
      \`rank\` = :rank;`, 
    {
      servant_id: servant_id, 
      passive_id: passive_id[0]['passive_id'], 
      rank: passive_skills[ps_names[i]]['Rank']
    });

    // Get passive from db with passive name and rank as param
    const passive = await database_manager.queryDatabase(`
      SELECT passive 
      FROM \`passive effects\` 
      WHERE passive = :passive AND \`rank\` = :rank;`, 
    {
      passive: ps_names[i],
      rank: passive_skills[ps_names[i]]['Rank']
    });

    // Checks if passive name and rank is recorded into db
    if(passive.length == 0) {
      // If not, insert into db
      await database_manager.queryDatabase(`
        INSERT INTO \`passive effects\` 
        (passive, \`rank\`, effect) 
        VALUES (:passive, :rank, :effect) 
        ON DUPLICATE KEY UPDATE 
        \`rank\` = :rank, 
        effect = :effect;`, 
      {
        passive: ps_names[i], 
        rank: passive_skills[ps_names[i]]['Rank'], 
        effect: effect
      });
    }
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
    let trait_id = await database_manager.queryDatabase(`SELECT trait_id FROM \`traits\` WHERE trait LIKE ?;`, [trait]);

    if(trait_id.length == 0) {
      await database_manager.queryDatabase(`INSERT INTO \`traits\` (trait) VALUES (?);`, [trait]);
      trait_id = await database_manager.queryDatabase(`SELECT trait_id FROM \`traits\` WHERE trait LIKE ?;`, [trait]);
    }

    database_manager.queryDatabase(`INSERT INTO \`servant traits\` 
    (servant_id, trait_id) 
    VALUES (:servant_id, :trait_id) 
    ON DUPLICATE KEY UPDATE trait_id = :trait_id;`, 
    {
      servant_id: servant_id,
      trait_id: trait_id[0]['trait_id']
    });
  }
}

const insert_images = async (servant_id, image_path, icon_image_path) => {
  await database_manager.queryDatabase(`
    INSERT INTO images 
    (path) 
    VALUES (:image_path) 
    ON DUPLICATE KEY UPDATE 
    path = :image_path;`, 
  {
    image_path: image_path
  });

  await database_manager.queryDatabase(`
    INSERT INTO images 
    (path) 
    VALUES (:image_path) 
    ON DUPLICATE KEY UPDATE 
    path = :image_path;`, 
  {
    image_path: icon_image_path
  });

  const image_id = await database_manager.queryDatabase(`SELECT image_id FROM images WHERE path = :image_path;`, 
  {
    image_path: image_path
  });

  const icon_image_id = await database_manager.queryDatabase(`SELECT image_id FROM images WHERE path = :image_path;`, 
  {
    image_path: icon_image_path
  });

  await database_manager.queryDatabase(`
    INSERT INTO \`ascension images\` 
    (servant_id, image_id, ascension) 
    VALUES (:servant_id, :image_id, 4) 
    ON DUPLICATE KEY UPDATE 
    image_id = :image_id;`, 
  {
    servant_id: servant_id,
    image_id: image_id[0]['image_id']
  });

  await database_manager.queryDatabase(`
    INSERT INTO \`ascension images\` 
    (servant_id, image_id, ascension) 
    VALUES (:servant_id, :image_id, 'icon') 
    ON DUPLICATE KEY UPDATE 
    image_id = :image_id;`, 
  {
    servant_id: servant_id,
    image_id: icon_image_id[0]['image_id']
  });
}

run()