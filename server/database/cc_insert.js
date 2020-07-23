const database_manager = require('./database-manager.js');
const fs = require('fs');

const run = () => {
  // Reads from the json file containing all servant's information
  const raw_data = fs.readFileSync('../../scraper/cc_details.json', 'utf8');
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

    database_manager.queryDatabase(`INSERT INTO \`command codes\`
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
  }

  // Close connection to database
  database_manager.end();
}

run()