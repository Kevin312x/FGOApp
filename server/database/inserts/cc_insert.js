const database_manager = require('../database-manager.js');
const fs = require('fs');

const run = async () => {
  // Reads from the json file containing all command code's information
  const raw_data = fs.readFileSync('../../../scraper/cc_details.json', 'utf8');
  const command_codes = JSON.parse(raw_data);

  // Store all the keys for the dict into an array
  const name_keys = Object.keys(command_codes);

  // Inserts all information about the command codes into the database
  for(let i = 0; i < name_keys.length; ++i) {
    const name = name_keys[i];
    const id = command_codes[name]['ID'];
    const effect = command_codes[name]['Effect']
    const rarity = command_codes[name]['Rarity'];
    const illustrator = command_codes[name]['Illustrator'];
    const description = command_codes[name]['Description'];
    const path = command_codes[name]['Image Path'];

    await database_manager.queryDatabase(`
      INSERT INTO \`command codes\`
      (code_id, name, effect, rarity, illustrator, description) 
      VALUES (:code_id, :name, :effect, :rarity, :illustrator, :description)
      ON DUPLICATE KEY UPDATE
      name = :name,
      effect = :effect,
      description = :desription;`, 
    {
      code_id: id,
      name: name,
      effect: effect,
      rarity: rarity,
      illustrator: illustrator,
      description: description
    });

    await database_manager.queryDatabase(`
      INSERT INTO images 
      (path) 
      VALUES (:path) 
      ON DUPLICATE KEY UPDATE 
      path = :path;`, 
    {
      path: path
    });

    const image_id = await database_manager.queryDatabase(`
      SELECT image_id 
      FROM images 
      WHERE path = :path;`, 
    {
      path: path
    });

    await database_manager.queryDatabase(`
      INSERT INTO \`command code images\` 
      (image_id, code_id) 
      VALUES (:image_id, :code_id) 
      ON DUPLICATE KEY UPDATE
      image_id = :image_id,  
      code_id = :code_id;`, 
    {
      image_id: image_id[0]['image_id'],
      code_id: id
    });
  }

  // Close connection to database
  database_manager.end();
}

run()