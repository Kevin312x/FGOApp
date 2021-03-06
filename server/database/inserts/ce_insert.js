const database_manager = require('../database-manager.js')
const fs = require('fs')

const run = async () => {
  // Reads from the json file containing all craft essences's information
  const raw_data = fs.readFileSync('../../../scraper/ce_details.json', 'utf8');
  const craft_essenses = JSON.parse(raw_data);

  // Store all the keys for the dict into an array
  const keys = Object.keys(craft_essenses);

  // Inserts all information about the craft essences into the database
  for(let i = 0; i < keys.length; ++i) {
    const effect = (craft_essenses[keys[i]]['Effect'] != null ? craft_essenses[keys[i]]['Effect'].join('\n') : null);
    const mlb_effect = (craft_essenses[keys[i]]['MLB Effect'] != null ? craft_essenses[keys[i]]['MLB Effect'].join('\n') : 'N/A');

    // Extracts cost_id from the given cost
    await database_manager.queryDatabase(`
      INSERT INTO costs 
      (cost) 
      VALUES (:cost)
      ON DUPLICATE KEY UPDATE 
      cost = :cost;`, 
    {
      cost: parseInt(craft_essenses[keys[i]]['Cost'])
    });

    const cost_id = await database_manager.queryDatabase(`
      SELECT cost_id 
      FROM costs 
      WHERE cost = :cost`, 
    {
      cost: parseInt(craft_essenses[keys[i]]['Cost'])
    });

    // Inserts into the database
    await database_manager.queryDatabase(`
      INSERT INTO \`craft essences\` 
      (ce_id, \`name\`, min_hp, min_atk, max_hp, max_atk, rarity, effect, illustrator, mlb_effect, \`description\`, cost_id) 
      VALUES (:ce_id, :name, :min_hp, :min_atk, :max_hp, :max_atk, :rarity, :effect, :illustrator, :mlb_effect, :description, :cost_id)
      ON DUPLICATE KEY UPDATE 
      effect = :effect, 
      mlb_effect = :mlb_effect, 
      \`description\` = :description;`, 
    {
      ce_id: parseInt(craft_essenses[keys[i]]['ID']), 
      name: keys[i], 
      min_hp: craft_essenses[keys[i]]['Min HP'], 
      min_atk: craft_essenses[keys[i]]['Min ATK'], 
      max_hp: craft_essenses[keys[i]]['Max HP'], 
      max_atk: craft_essenses[keys[i]]['Max ATK'], 
      rarity: parseInt(craft_essenses[keys[i]]['Rarity']), 
      effect: effect, 
      illustrator: craft_essenses[keys[i]]['Illustrator'], 
      mlb_effect: mlb_effect, 
      description: craft_essenses[keys[i]]['Dialogue'], 
      cost_id: cost_id[0]['cost_id']
    });

    // Inserts image paths into the image table
    await database_manager.queryDatabase(`
      INSERT INTO images 
      (path) 
      VALUES (:path) 
      ON DUPLICATE KEY UPDATE path = :path;`, 
    {
      path: craft_essenses[keys[i]]['Image Path']
    });

    // Inserts ce_id and image_id into the ce images table
    database_manager.queryDatabase(`
      INSERT INTO \`craft essence images\` 
      (ce_id, image_id) 
      WITH image_cte AS (
        SELECT image_id 
        FROM images 
        WHERE path = :path
      )
      SELECT :ce_id, cte.image_id 
      FROM image_cte AS cte 
      ON DUPLICATE KEY UPDATE 
      ce_id = ce_id;`, 
    {
      path: craft_essenses[keys[i]]['Image Path'], 
      ce_id: parseInt(craft_essenses[keys[i]]['ID']),
    });
  }

  database_manager.end()
}

run();