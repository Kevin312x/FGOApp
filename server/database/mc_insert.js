const database_manager = require('./database-manager.js')
const fs = require('fs')

const run = async () => {
  const raw_data = fs.readFileSync('../../scraper/mc_details.json', 'utf8');
  const mystic_codes = JSON.parse(raw_data);

  const keys = Object.keys(mystic_codes);

  for(let i = 0; i < keys.length; ++i) {
    const mystic_code = mystic_codes[keys[i]];
    const skills = Object.keys(mystic_code['Skills']);
    await database_manager.queryDatabase(`INSERT INTO \`mystic codes\` (mystic_code) VALUES (?) ON DUPLICATE KEY UPDATE mystic_code = ?;`, [keys[i], keys[i]]);
    const mc_id = await database_manager.queryDatabase(`SELECT mystic_code_id FROM \`mystic codes\` 
      WHERE mystic_code = ? LIMIT 1;`, [keys[i]]);

    for(let j = 0; j < skills.length; ++j) {
      database_manager.queryDatabase(`INSERT INTO \`mystic code skills\` (mystic_code_id, skill_name, effect, skill_number) 
        VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mystic_code_id = ?, skill_number = ?;`, 
        [mc_id[0]['mystic_code_id'], skills[j], mystic_code['Skills'][skills[j]]['Effect'], mystic_code['Skills'][skills[j]]['Skill Number'],
        mc_id[0]['mystic_code_id'], mystic_code['Skills'][skills[j]]['Skill Number']]);
    }

  }

  database_manager.end();
};

run();