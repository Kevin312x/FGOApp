const database_manager = require('../database-manager.js')
const fs = require('fs')

const insert_mc_images = async (mystic_code, mc_id) => {
  await database_manager.queryDatabase(`
    INSERT INTO images 
    (path) 
    VALUES (:path) 
    ON DUPLICATE KEY UPDATE 
    path = :path;`, 
  {
      path: mystic_code['Male Img']
  });

  await database_manager.queryDatabase(`
    INSERT INTO \`mystic code images\` 
    (mystic_code_id, mc_image_id, gender) 
    WITH image_id_cte AS (
      SELECT image_id 
      FROM images 
      WHERE path = :path
    )
    SELECT :mystic_code_id, image_id_cte.image_id, :gender 
    FROM image_id_cte 
    ON DUPLICATE KEY UPDATE 
    mystic_code_id = :mystic_code_id, 
    gender = :gender;`, 
  {
    path: mystic_code['Male Img'], 
    mystic_code_id: mc_id[0]['mystic_code_id'],
    gender: 'm'
  });

  await database_manager.queryDatabase(`
    INSERT INTO images 
    (path) 
    VALUES (:path) 
    ON DUPLICATE KEY UPDATE 
    path = :path;`, {
      path: mystic_code['Female Img']
  });

  await database_manager.queryDatabase(`
    INSERT INTO \`mystic code images\` 
    (mystic_code_id, mc_image_id, gender) 
    WITH image_id_cte AS (
      SELECT image_id 
      FROM images 
      WHERE path = :path
    )
    SELECT :mystic_code_id, image_id_cte.image_id, :gender 
    FROM image_id_cte 
    ON DUPLICATE KEY UPDATE 
    mystic_code_id = :mystic_code_id, 
    gender = :gender;`, 
  {
    path: mystic_code['Female Img'], 
    mystic_code_id: mc_id[0]['mystic_code_id'],
    gender: 'f'
  });
}

const run = async () => {
  // Reads from the json file containing all mystic code's information
  const raw_data = fs.readFileSync('../../../scraper/mc_details.json', 'utf8');
  const mystic_codes = JSON.parse(raw_data);

  // Store all the keys for the dict into an array
  const keys = Object.keys(mystic_codes);

  // Inserts all information about the mystic codes into the database
  for(let i = 0; i < keys.length; ++i) {
    const mystic_code = mystic_codes[keys[i]];
    const skills = mystic_code['Skills']
    const skills_key = Object.keys(skills);

    await database_manager.queryDatabase(`
      INSERT INTO \`mystic codes\` 
      (mystic_code) 
      VALUES (:mc) 
      ON DUPLICATE KEY UPDATE 
      mystic_code = :mc;`, 
    {
      mc: keys[i]
    });

    // Retrieve the recently inserted mystic code's mc_id for future use
    const mc_id = await database_manager.queryDatabase(`
      SELECT mystic_code_id 
      FROM \`mystic codes\` 
      WHERE mystic_code = :mc 
      LIMIT 1;`, 
    {
      mc: keys[i]
    });

    // Insert the skills of the mystic code into the database
    for(let j = 0; j < skills_key.length; ++j) {
      await database_manager.queryDatabase(`
        INSERT INTO \`mystic code skills\` 
        (mystic_code_id, skill_name, effect, skill_number) 
        VALUES (:mc_id, :skill_name, :effect, :skill_number) 
        ON DUPLICATE KEY UPDATE skill_name = :skill_name, effect = :effect;`, 
        {
          mc_id: mc_id[0]['mystic_code_id'], 
          skill_name: skills_key[j], 
          effect: skills[skills_key[j]]['Effect'], 
          skill_number: skills[skills_key[j]]['Skill Number']
        });

      const mc_skill_id = await database_manager.queryDatabase(`
        SELECT mystic_code_skill_id 
        FROM \`mystic code skills\` 
        WHERE mystic_code_id = :mc_id 
        AND skill_number = :skill_number;`, 
      {
        mc_id: mc_id[0]['mystic_code_id'],
        skill_number: j+1,
      });
      const skill_ups = skills[skills_key[j]]['Skill Ups'];
      const skill_up_keys = Object.keys(skill_ups);
      
      if(skill_up_keys.length > 0) {
        // Inserts the skill levels of each skill into the database        
        for(let k = 0; k < skill_up_keys.length; ++k) {
          let cooldown = parseInt(skills[skills_key[j]]['Cooldowns']);

          for(let skill_levels = 0; skill_levels < 10; ++skill_levels) {
            if(skill_levels + 1 == 6) { cooldown -= 1; }
            else if (skill_levels + 1 == 10) { cooldown -= 1; }

            await database_manager.queryDatabase(`
              INSERT INTO \`mystic code skill levels\` 
              (mystic_code_id, mystic_code_skill_id, skill_level, modifier, cooldown, skill_number, skill_up_effect) 
              VALUES (:mc_id, :mc_skill_id, :skill_level, :modifier, :cooldown, :skill_number, :skill_up_effect) 
              ON DUPLICATE KEY UPDATE 
              modifier = :modifier, 
              cooldown = :cooldown, 
              skill_up_effect = :skill_up_effect;`, 
            {
              mc_id:        mc_id[0]['mystic_code_id'], 
              mc_skill_id:  mc_skill_id[0]['mystic_code_skill_id'], 
              skill_level:  skill_levels+1, 
              modifier:     skill_ups[skill_up_keys[k]][skill_levels],
              cooldown:     cooldown, 
              skill_number: skills[skills_key[j]]['Skill Number'],
              skill_up_effect: skill_up_keys[k]
            });
          }
        }
      } else {
        let cooldown = parseInt(skills[skills_key[j]]['Cooldowns']);
        for(let skill_levels = 0; skill_levels < 10; ++skill_levels) {
          if(skill_levels + 1 == 6) { cooldown -= 1; }
          else if (skill_levels + 1 == 10) { cooldown -= 1; }

          await database_manager.queryDatabase(`
            INSERT INTO \`mystic code skill levels\` 
            (mystic_code_id, mystic_code_skill_id, skill_level, modifier, cooldown, skill_number, skill_up_effect) 
            VALUES (:mc_id, :mc_skill_id, :skill_level, :modifier, :cooldown, :skill_number, :skill_up_effect) 
            ON DUPLICATE KEY UPDATE 
            modifier = :modifier, 
            cooldown = :cooldown, 
            skill_up_effect = :skill_up_effect;`, 
          {
            mc_id:        mc_id[0]['mystic_code_id'], 
            mc_skill_id:  mc_skill_id[0]['mystic_code_skill_id'], 
            skill_level:  skill_levels+1, 
            modifier:     null,
            cooldown:     cooldown, 
            skill_number: skills[skills_key[j]]['Skill Number'],
            skill_up_effect: null
          });
        }
      }
      await insert_mc_images(mystic_code, mc_id);
    }
  }

  // Terminates connection to the database
  database_manager.end();
};

run();