const database_manager = require('./database-manager.js')
const fs = require('fs')

const run = () => {
  const raw_data = fs.readFileSync('../../scraper/ce_details.json', 'utf8');
  const craft_essenses = JSON.parse(raw_data);
  const keys = Object.keys(craft_essenses);

  for(let i = 0; i < keys.length; ++i) {
    effect = (craft_essenses[keys[i]]['Effect'] != null ? craft_essenses[keys[i]]['Effect'].join(' ') : null);
    mlb_effect = (craft_essenses[keys[i]]['MLB Effect'] != null ? craft_essenses[keys[i]]['MLB Effect'].join(' ') : 'N/A');
    
    database_manager.queryDatabase(`INSERT INTO \`craft essences\` 
    (ce_id, \`name\`, min_hp, min_atk, max_hp, max_atk, rarity, effect, illustrator, mlb_effect, \`description\`, cost) 
    VALUES (:ce_id, :name, :min_hp, :min_atk, :max_hp, :max_atk, :rarity, :effect, :illustrator, :mlb_effect, :description, :cost)
    ON DUPLICATE KEY UPDATE effect = :effect, mlb_effect = :mlb_effect;`, 
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
      cost: parseInt(craft_essenses[keys[i]]['Cost'])
    });
  }

  database_manager.end()
}

run();