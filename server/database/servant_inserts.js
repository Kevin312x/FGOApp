const database_manager = require('./database-manager.js');
const fs = require('fs');

const init = async () => {
  const raw_data = fs.readFileSync('../../servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  const keys = Object.keys(servants);

  for(let i = 0; i < keys.length; ++i) {
    await insert_servant(keys[i], servants[keys[i]]);
    console.log(i)
  }
}

const insert_servant = async (servant_name, servant_info) => {
  np = servant_info['Noble Phantasm'];

  const np_keys = Object.keys(servant_info['Noble Phantasm']);
  console.log(servant_name, 1)
  console.log(np[np_keys[0]]['Type']);

  // await database_manager.queryDatabase(`SELECT card_id FROM \`card types\` WHERE card_type = ?;`, []);
  // await database_manager.queryDatabase(`INSERT INTO \`noble phantasms\` `)

  // await database_manager.queryDatabase(`INSERT INTO servants 
  //   (name, rarity, min_hp, min_atk, max_hp, max_atk, 
  //     np_id, cost_id, illustrator, gender, death_rate, 
  //     attribute_id, star_weight, alignment_id, class_id, 
  //     np_gain_atk, np_gain_def, status, voice_actor, star_gen) 
  //   VALUES (${servant_name}, ${servant_info['Rarity']}, ${servant_info['Min HP']}, ${servant_info['Min ATK']}, ${servant_info['Max HP']}, ${servant_info['Max ATK']}, 
  //     );`, )
}

init()