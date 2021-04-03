const database_manager = require('../database-manager.js');
const fs = require('fs');

// Inserts into the classes effective database if given class has a modifier > 1.0
const insert_adv_classes = async (current_class, effective_against, modifier) => {
  const cte = await database_manager.queryDatabase(`
    INSERT INTO \`classes effective\` 
    (class_id, effective_against, modifier)
    WITH curr_class_cte AS (
      SELECT class_id 
      FROM classes 
      WHERE class_name = :current_class
    ), 
    class_disadv_cte AS (
      SELECT class_id 
      FROM classes 
      WHERE class_name = :disadv_class
    )
    SELECT curr_class_cte.class_id, class_disadv_cte.class_id, :modifier 
    FROM curr_class_cte, class_disadv_cte 
    ON DUPLICATE KEY UPDATE 
    modifier = :modifier;`, 
  {
    current_class: current_class, 
    disadv_class : effective_against, 
    modifier     : modifier
  });
}

// Inserts into the classes effective database if given class has a modifier < 1.0
const insert_disadv_classes = async (current_class, weak_against, modifier) => {
  await database_manager.queryDatabase(`
    INSERT INTO \`classes weak\` 
    (class_id, weak_against, modifier) 
    WITH curr_class_cte AS (
      SELECT class_id 
      FROM classes 
      WHERE class_name = :current_class
    ), 
    class_adv_cte AS (
      SELECT class_id 
      FROM classes 
      WHERE class_name = :adv_class
    )
    SELECT curr_class_cte.class_id, class_adv_cte.class_id, :modifier 
    FROM curr_class_cte, class_adv_cte 
    ON DUPLICATE KEY UPDATE 
    modifier = :modifier;`, 
    {
      current_class: current_class, 
      adv_class    : weak_against, 
      modifier     : modifier
    });
}

/**
 * Compares the modifiers for each class, round robin style
 * Depending on where the advantages fall, either call the 
 * insert_adv_classes() or insert_disadv_classes() function
 */
const run = async () => {
  database_manager.connect();
  const raw_data = fs.readFileSync('../../../scraper/class_affinity.json', 'utf8');
  const class_affinities = JSON.parse(raw_data);
  const keys = Object.keys(class_affinities);

  for(let i = 0; i < keys.length; ++i) {
    database_manager.queryDatabase(`INSERT INTO classes (class_name, atk_modifier) 
    VALUES (:class_name, :atk_modifier) 
    ON DUPLICATE KEY UPDATE atk_modifier = :atk_modifier;`, 
      {
        class_name: keys[i], 
        atk_modifier: class_affinities[keys[i]]['Base Multiplier']
      });
  }

  for(let i = 0; i < keys.length; ++i) {
    for(let j = 0; j < keys.length; ++j) {
      modifier = class_affinities[keys[i]][keys[j]]
      if(modifier.slice(0, 3) == '1.0') { continue; }
      await ((parseFloat(modifier.slice(0, modifier.length - 1)) > 1.0) ? insert_adv_classes(keys[i], keys[j], modifier) 
                                                                        : insert_disadv_classes(keys[i], keys[j], modifier));
    }
  }

  insert_class_images()
}

// Inserts links to class icons into database
const insert_class_images = async () => {
  // Links to each classes' respective icons
  const class_images_links = {
    'Shielder': 'https://vignette.wikia.nocookie.net/fategrandorder/images/a/ab/Class-Shielder-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130906',
    'Saber': 'https://vignette.wikia.nocookie.net/fategrandorder/images/b/b4/Class-Saber-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130858',
    'Archer': 'https://vignette.wikia.nocookie.net/fategrandorder/images/9/90/Class-Archer-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130706',
    'Lancer': 'https://vignette.wikia.nocookie.net/fategrandorder/images/7/79/Class-Lancer-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130840',
    'Rider': 'https://vignette.wikia.nocookie.net/fategrandorder/images/0/04/Class-Rider-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130852',
    'Caster': 'https://vignette.wikia.nocookie.net/fategrandorder/images/8/89/Class-Caster-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130807',
    'Assassin': 'https://vignette.wikia.nocookie.net/fategrandorder/images/7/7b/Class-Assassin-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130718',
    'Berserker': 'https://vignette.wikia.nocookie.net/fategrandorder/images/5/59/Class-Berserker-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130739',
    'Ruler': 'https://vignette.wikia.nocookie.net/fategrandorder/images/b/ba/Class-Ruler-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129131240',
    'Avenger': 'https://vignette.wikia.nocookie.net/fategrandorder/images/1/13/Class-Avenger-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130729',
    'Moon Cancer': 'https://vignette.wikia.nocookie.net/fategrandorder/images/3/3b/Class-MoonCancer-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130846',
    'Alter Ego': 'https://vignette.wikia.nocookie.net/fategrandorder/images/9/99/Class-Alterego-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130649',
    'Beast': 'https://vignette.wikia.nocookie.net/fategrandorder/images/1/13/Class-Beast.png/revision/latest/scale-to-width-down/35?cb=20190128120615',
    'Foreigner': 'https://vignette.wikia.nocookie.net/fategrandorder/images/7/70/Class-Foreigner-Gold.png/revision/latest/scale-to-width-down/35?cb=20190129130835', 
    'Beast': 'https://static.wikia.nocookie.net/fategrandorder/images/1/13/Class-Beast.png/revision/latest/scale-to-width-down/35?cb=20190128120615'
  };
  // Obtain the class names
  const class_names = await database_manager.queryDatabase(`
    SELECT class_id, class_name 
    FROM classes 
    ORDER BY class_id ASC;`, 
  {});

  const class_image_names = Object.keys(class_images_links);
  // Iterate through object
  for(let i = 0; i < class_names.length; ++i) {
    // Retrieve the class_id of the respective class
    let class_id = class_names[i]['class_id'];
    // Find image name of class
    let class_name = ''
    for(let j = 0; j < class_image_names.length; ++j) {
      if(class_names[i]['class_name'].includes(class_image_names[j]) || 
        class_image_names[j].includes(class_names[i]['class_name'])) {
          class_name = class_image_names[j];
          break;
        }
    }

    // Insert the class icon links into images
    await database_manager.queryDatabase(`
      INSERT INTO images 
      (path) 
      VALUES (:path)
      ON DUPLICATE KEY UPDATE 
      path = :path;`, 
    {
      path: class_images_links[class_name]
    });

    // Insert into class images the class_id and the image_id
    await database_manager.queryDatabase(`
      INSERT INTO \`class images\` 
      (image_id, class_id) 
      WITH image_cte AS (
        SELECT image_id 
        FROM images 
        WHERE path = :path
      )
      SELECT image_cte.image_id, :class_id 
      FROM image_cte 
      ON DUPLICATE KEY UPDATE 
      class_id = :class_id;`, 
    {
      path    : class_images_links[class_name],
      class_id: class_id
    });
  }

  database_manager.end()
}

run()