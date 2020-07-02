const database_manager = require('./database-manager.js');
const fs = require('fs');

const insert_adv_classes = async (current_class, effective_against, modifier) => {
  current_class_id = await database_manager.queryDatabase(`SELECT class_id FROM classes WHERE class_name = ?;`, [current_class]);
  effective_against_id = await database_manager.queryDatabase(`SELECT class_id FROM classes WHERE class_name = ?;`, [effective_against]);
  await database_manager.queryDatabase(`INSERT INTO \`classes effective\` (class_id, effective_against, modifier) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE modifier = ?;`, 
    [current_class_id[0]['class_id'], effective_against_id[0]['class_id'], modifier, modifier]);
}

const insert_disadv_classes = async (current_class, weak_against, modifier) => {
  current_class_id = await database_manager.queryDatabase(`SELECT class_id FROM classes WHERE class_name = ?;`, [current_class]);
  weak_against_id = await database_manager.queryDatabase(`SELECT class_id FROM classes WHERE class_name = ?;`, [weak_against]);
  await database_manager.queryDatabase(`INSERT INTO \`classes weak\` (class_id, weak_against, modifier) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE modifier = ?;`, 
    [current_class_id[0]['class_id'], weak_against_id[0]['class_id'], modifier, modifier]);
}

const insert_classes = async () => {
  const raw_data = fs.readFileSync('../../scraper/class_affinity.json', 'utf8');
  const class_affinities = JSON.parse(raw_data);

  const keys = Object.keys(class_affinities);

  for(let i = 0; i < keys.length; ++i) {
    database_manager.queryDatabase(`INSERT INTO classes (class_name, atk_modifier) VALUES (?, ?) ON DUPLICATE KEY UPDATE class_id = ?;`, 
      [keys[i], class_affinities[keys[i]]['Base Multiplier'], i+1]);
  }

  for(let i = 0; i < keys.length; ++i) {
    for(let j = 0; j < keys.length; ++j) {
      modifier = class_affinities[keys[i]][keys[j]]
      if(modifier.slice(0, 3) == '1.0') { continue; }
      await ((parseFloat(modifier.slice(0, modifier.length - 1)) > 1.0) ? insert_adv_classes(keys[i], keys[j], modifier) : insert_disadv_classes(keys[i], keys[j], modifier));
    }
  }

  database_manager.end()
}

insert_classes()