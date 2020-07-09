const database_manager = require('./database-manager.js')
const fs = require('fs')

const run = () => {
  const raw_data = fs.readFileSync('../../scraper/ce_details.json', 'utf8');
  const craft_essenses = JSON.parse(raw_data);

  const keys = Object.keys(craft_essenses)

  for(let i = 0; i < keys.length; ++i) {
    effect = (craft_essenses[keys[i]]['Effect'] != null ? craft_essenses[keys[i]]['Effect'].join(' ') : null);
    mlb_effect = (craft_essenses[keys[i]]['MLB Effect'] != null ? craft_essenses[keys[i]]['MLB Effect'].join(' ') : 'N/A');
    
    database_manager.queryDatabase(`INSERT INTO \`craft essences\` 
    (ce_id, \`name\`, min_hp, min_atk, max_hp, max_atk, rarity, effect, illustrator, mlb_effect, \`description\`, cost) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE effect = ?, mlb_effect = ?;`, 
    [parseInt(craft_essenses[keys[i]]['ID']), keys[i], craft_essenses[keys[i]]['Min HP'], craft_essenses[keys[i]]['Min ATK'], 
     craft_essenses[keys[i]]['Max HP'], craft_essenses[keys[i]]['Max ATK'], parseInt(craft_essenses[keys[i]]['Rarity']), effect, 
     craft_essenses[keys[i]]['Illustrator'], mlb_effect, craft_essenses[keys[i]]['Dialogue'], parseInt(craft_essenses[keys[i]]['Cost']),
     effect, mlb_effect]);
  }

  database_manager.end()
}

run();