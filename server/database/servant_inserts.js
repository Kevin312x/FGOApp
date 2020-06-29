const database_manager = require('./database-manager.js');
const fs = require('fs');

const init = () => {
  const raw_data = fs.readFileSync('../../servant_details.json', 'utf8');
  const servants = JSON.parse(raw_data);

  const keys = Object.keys(servants)

  for(let i = 0; i < keys.length; ++i) {
    console.log(servants[keys[i]])
  }
}

init()