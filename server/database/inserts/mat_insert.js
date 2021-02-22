const database_manager = require('../database-manager.js');
const fs = require('fs');

const run = async () => {
  // Reads from the json file containing all material's information
  const raw_data = fs.readFileSync('../../../scraper/material_details.json', 'utf8');
  const materials = JSON.parse(raw_data);

  // Store all the keys for the dict into an array
  const keys = Object.keys(materials);
  
  // Iterate over all materials and add them to database
  for(let i = 0; i < keys.length; ++i) {
    const material_name   = keys[i];
    const material_info   = materials[material_name];
    const material_rarity = material_info.Rarity;
    const material_image  = material_info.Image;
    const material_descr  = (material_info.Description != null) ? material_info.Description.join('') : null;

    // Insert image into db
    await database_manager.queryDatabase(`
      INSERT INTO images (path) 
      VALUES (:path) 
      ON DUPLICATE KEY UPDATE 
      path = :path;`, 
    {
        path: material_image
    });

    // Retrieve image_id given path
    const image_id = await database_manager.queryDatabase(`
      SELECT image_id 
      FROM images 
      WHERE path = :path;`, 
    {
      path: material_image
    });

    // Insert material
    await database_manager.queryDatabase(`
      INSERT INTO materials 
      (name, rarity, image_id, \`description\`) 
      VALUES (:name, :rarity, :image_id, :description) 
      ON DUPLICATE KEY UPDATE 
      image_id = :image_id, 
      \`description\` = :description;`, 
    {
      name:         material_name,
      rarity:       material_rarity, 
      image_id:     image_id[0]['image_id'],
      description:  material_descr
    });
  }

  database_manager.end();
}

run();