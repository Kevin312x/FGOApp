const database_manager = require('./database-manager.js');
const fs = require('fs');

const init = () => {
  const raw_data = fs.readFileSync('../../servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  const keys = Object.keys(servants);

  for(let i = 0; i < keys.length; ++i) {
    insert_servant(keys[i], servants[keys[i]]);
  }
}

const insert_servant = async (servant_name, servant_info) => {
  console.log(servant_name, servant_info)
}

init()