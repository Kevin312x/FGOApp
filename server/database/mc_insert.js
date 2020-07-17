const database_manager = require('./database-manager.js')
const fs = require('fs')

const run = async () => {
  const raw_data = fs.readFileSync('../../scraper/mc_details.json', 'utf8');
  const mystic_codes = JSON.parse(raw_data);

  const keys = Object.keys(mystic_codes);

  for(let i = 0; i < keys.length; ++i) {
    const mystic_code = mystic_codes[keys[i]];
    const skills = mystic_code['Skills']
    const skills_key = Object.keys(skills);
    await database_manager.queryDatabase(`INSERT INTO \`mystic codes\` (mystic_code) VALUES (?) ON DUPLICATE KEY UPDATE mystic_code = ?;`, [keys[i], keys[i]]);
    const mc_id = await database_manager.queryDatabase(`SELECT mystic_code_id FROM \`mystic codes\` 
      WHERE mystic_code = ? LIMIT 1;`, [keys[i]]);

    for(let j = 0; j < skills_key.length; ++j) {
      await database_manager.queryDatabase(`INSERT INTO \`mystic code skills\` (mystic_code_id, skill_name, effect, skill_number) 
        VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mystic_code_id = ?, skill_number = ?;`, 
        [mc_id[0]['mystic_code_id'], skills_key[j], skills[skills_key[j]]['Effect'], skills[skills_key[j]]['Skill Number'],
        mc_id[0]['mystic_code_id'], skills[skills_key[j]]['Skill Number']]);
      
      const mc_skill_id = await database_manager.queryDatabase(`SELECT mystic_code_skill_id FROM \`mystic code skills\` ORDER BY mystic_code_skill_id DESC LIMIT 1;`);
      const skill_ups = skills[skills_key[j]]['Skill Ups'];
      const skill_up_keys = Object.keys(skill_ups);

      if(skill_up_keys.length != 0) {
        
        for(let k = 0; k < skill_up_keys.length; ++k) {
          let cooldown = parseInt(skills[skills_key[j]]['Cooldowns']);
          
          for(let skill_levels = 0; skill_levels < 10; ++skill_levels) {
            if(skill_levels + 1 == 6) { cooldown -= 1; }
            else if (skill_levels + 1 == 10) { cooldown -= 1; }

            await database_manager.queryDatabase(`INSERT INTO \`mystic code skill levels\` 
            (mystic_code_id, mystic_code_skill_id, skill_level, modifier, cooldown, skill_number) 
            VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE modifier = ?;`, 
            [mc_id[0]['mystic_code_id'], mc_skill_id[0]['mystic_code_skill_id'], skill_levels+1, skill_ups[skill_up_keys[k]][skill_levels],
             cooldown, skills[skills_key[j]]['Skill Number'], skill_ups[skill_up_keys[k]][skill_levels]]);
          }
        }
      }
    }
  }

  database_manager.end();
};

run();