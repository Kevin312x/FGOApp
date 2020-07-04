const database_manager = require('./database-manager.js');
const fs = require('fs');

const run = async () => {
  // Reads from the json file containing all servant's information
  const raw_data = fs.readFileSync('../../scraper/servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  // Retrieves the names of the servants
  const keys = Object.keys(servants);

  // Reads from the file and inserts each servants and their info in the database
  for(let i = 0; i < keys.length; ++i) {
    await insert_servant(keys[i], servants[keys[i]]);
    await insert_noble_phantasm(servants[keys[i]]['ID'], servants[keys[i]]['Noble Phantasm'])
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
      status = 'permanent'
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE servant_id = ?;`, 
    [servant_info['ID'], servant_name, servant_info['Rarity'], servant_info['Min HP'], servant_info['Min Atk'], servant_info['Max HP'], 
     servant_info['Max Atk'], cost_id[0]['cost_id'], servant_info['Illustrator'], servant_info['Gender'], servant_info['Death Rate'],
     attribute_id[0]['attribute_id'], servant_info['Star Absorbtion'], alignment_id[0]['alignment_id'], class_id[0]['class_id'], 
     servant_info['NP Charge Atk'], servant_info['NP Charge Def'], status, servant_info['Voice Actor'], servant_info['Star Generation'], servant_info['ID']]);

  await database_manager.queryDatabase(`INSERT INTO \`servant stats\` (servant_id, strength, endurance, agility, mana, luck, np) 
    VALUES (?, ?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE servant_id = ?;`, 
    [servant_info['ID'], servant_info['Stats']['Strength'], servant_info['Stats']['Endurance'], servant_info['Stats']['Agility'], 
     servant_info['Stats']['Mana'], servant_info['Stats']['Luck'], servant_info['Stats']['NP'], servant_info['ID']]);
}

const insert_noble_phantasm = async (servant_id, servant_info_np) => {
  // Each servant has a different np, so we need the key (np name)
  const np_keys = Object.keys(servant_info_np);
  const np_name = np_keys[0];

  let card_type = servant_info_np[np_name]['Type'];

  // Some enemy only servant's, like Solomon, np card type cannot be determined 
  if(card_type == '-') { card_type = 'None' }

  // Retrieves the card_id from the given card type
  const card_id = await database_manager.queryDatabase(`SELECT card_id FROM \`card types\` WHERE card_type = ?;`, [card_type]);

  let np_id = await database_manager.queryDatabase(`SELECT np_id FROM \`noble phantasms\` WHERE servant_id = ?;`, [servant_id]);

  // If np_id doesn't already exist for that servant, then insert it and retrieves the np_id
  if(np_id.length == 0) {
    // Inserts the servant's noble phantasm into the database then retrieves the np_id
    await database_manager.queryDatabase(`INSERT INTO \`noble phantasms\`(name, card_id, servant_id) VALUES (?, ?, ?);`, [np_name, card_id[0]['card_id'], servant_id]);
    np_id = await database_manager.queryDatabase(`SELECT np_id FROM \`noble phantasms\` ORDER BY np_id DESC LIMIT 1;`, []);
  }
  console.log(np_id)
  return np_id;
}

run()