const database_manager = require('./database-manager.js');
const fs = require('fs');

const run = async () => {
  const raw_data = fs.readFileSync('../../scraper/servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  const keys = Object.keys(servants);

  for(let i = 0; i < keys.length; ++i) {
    await insert_servant(keys[i], servants[keys[i]]);
  }

  database_manager.end()
}

const insert_servant = async (servant_name, servant_info) => {
  np = servant_info['Noble Phantasm'];

  const np_keys = Object.keys(servant_info['Noble Phantasm']);
  np_name = np_keys[0];
  
  let card_type = np[np_name]['Type'];
  let attribute = servant_info['Attribute'];
  let status = 'permanent';

  if(card_type == '-') { card_type = 'None' }
  if(attribute == '') { attribute = 'None' }
  switch(servant_info['Status']) {
    case 'LOCKED':
      status = 'story';
    case 'Limited Servant':
      status = 'limited';
    case 'Event Servant':
      status = 'event';
    default:
  }

  const card_id = await database_manager.queryDatabase(`SELECT card_id FROM \`card types\` WHERE card_type = ?;`, [card_type]);
  const cost_id = await database_manager.queryDatabase(`SELECT cost_id FROM costs WHERE cost = ?;`, [servant_info['Cost']]);
  const attribute_id = await database_manager.queryDatabase(`SELECT attribute_id FROM \`attributes\` WHERE attribute = ?;`, [attribute]);
  let alignment_id = await database_manager.queryDatabase(`SELECT alignment_id FROM alignments WHERE alignment = ?;`, [servant_info['Alignment']]);
  console.log(card_id)
  if(alignment_id.length == 0) { await database_manager.queryDatabase(`INSERT INTO alignments (alignment) VALUES (?);`, [servant_info['Alignment']]); }
  alignment_id = await database_manager.queryDatabase(`SELECT alignment_id FROM alignments WHERE alignment = ?;`, [servant_info['Alignment']]);

  await database_manager.queryDatabase(`INSERT INTO \`noble phantasms\`(name, card_id) VALUES (?, ?);`, [np_name, card_id[0]['card_id']]);
  np_id = await database_manager.queryDatabase(`SELECT np_id FROM \`noble phantasms\` ORDER BY card_id DESC LIMIT 1;`, []);

  console.log(servant_name)

  await database_manager.queryDatabase(`INSERT INTO servants 
    (name, rarity, min_hp, min_atk, max_hp, max_atk, 
      np_id, cost_id, illustrator, gender, death_rate, 
      attribute_id, star_weight, alignment_id, class_id, 
      np_gain_atk, np_gain_def, status, voice_actor, star_gen) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
    [servant_name, servant_info['Rarity'], servant_info['Min HP'], servant_info['Min ATK'], servant_info['Max HP'], servant_info['Max ATK'], 
     np_id[0]['np_id'], cost_id[0]['cost_id'], servant_info['Illustrator'], servant_info['Gender'], servant_info['Death Rate'],
     attribute_id[0]['attribute_id'], servant_info['Star Absorbtion'], alignment_id[0]['alignment_id'], /*servant_info['Class']*/, 
     servant_info['NP Charge Atk'], servant_info['NP Charge Def'], status, servant_info['Voice Actor'], servant_info['Star Generation']]);
}

run()
