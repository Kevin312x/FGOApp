const database_manager = require('./database-manager.js')
const fs = require('fs')

const run = async () => {
  // Reads from the json file containing all mystic code's information
  const raw_data = fs.readFileSync('../../scraper/mc_details.json', 'utf8');
  const mystic_codes = JSON.parse(raw_data);

  // Store all the keys for the dict into an array
  const keys = Object.keys(mystic_codes);

  // Inserts all information about the mystic codes into the database
  for(let i = 0; i < keys.length; ++i) {
    const mystic_code = mystic_codes[keys[i]];
    const skills = mystic_code['Skills']
    const skills_key = Object.keys(skills);

    await database_manager.queryDatabase(`INSERT INTO \`mystic codes\` (mystic_code) VALUES (:mc) ON DUPLICATE KEY UPDATE mystic_code = :mc;`, 
    {
      mc: keys[i]
    });

    // Retrieve the recently inserted mystic code's mc_id for future use
    const mc_id = await database_manager.queryDatabase(`SELECT mystic_code_id FROM \`mystic codes\` 
      WHERE mystic_code = ? LIMIT 1;`, [keys[i]]);

    // Insert the skills of the mystic code into the database
    for(let j = 0; j < skills_key.length; ++j) {
      await database_manager.queryDatabase(`INSERT INTO \`mystic code skills\` (mystic_code_id, skill_name, effect, skill_number) 
        VALUES (:mc_id, :skill_name, :effect, :skill_number) 
        ON DUPLICATE KEY UPDATE skill_name = :skill_name, effect = :effect;`, 
        {
          mc_id: mc_id[0]['mystic_code_id'], 
          skill_name: skills_key[j], 
          effect: skills[skills_key[j]]['Effect'], 
          skill_number: skills[skills_key[j]]['Skill Number']
        });
      
      const mc_skill_id = await database_manager.queryDatabase(`SELECT mystic_code_skill_id FROM \`mystic code skills\` ORDER BY mystic_code_skill_id DESC LIMIT 1;`);
      const skill_ups = skills[skills_key[j]]['Skill Ups'];
      const skill_up_keys = Object.keys(skill_ups);

      // Inserts the skill levels of each skill into the database
      if(skill_up_keys.length != 0) {
        
        for(let k = 0; k < skill_up_keys.length; ++k) {
          let cooldown = parseInt(skills[skills_key[j]]['Cooldowns']);
          
          for(let skill_levels = 0; skill_levels < 10; ++skill_levels) {
            if(skill_levels + 1 == 6) { cooldown -= 1; }
            else if (skill_levels + 1 == 10) { cooldown -= 1; }

            await database_manager.queryDatabase(`INSERT INTO \`mystic code skill levels\` 
            (mystic_code_id, mystic_code_skill_id, skill_level, modifier, cooldown, skill_number) 
            VALUES (:mc_id, :mc_skill_id, :skill_level, :modifier, :cooldown, :skill_number) ON DUPLICATE KEY UPDATE modifier = :modifier;`, 
            {
              mc_id:        mc_id[0]['mystic_code_id'], 
              mc_skill_id:  mc_skill_id[0]['mystic_code_skill_id'], 
              skill_level:  skill_levels+1, 
              modifier:     skill_ups[skill_up_keys[k]][skill_levels],
              cooldown:     cooldown, 
              skill_number: skills[skills_key[j]]['Skill Number']
            });
          }
        }
      }
    }
  }

  // Terminates connection to the database
  database_manager.end();
};

run();