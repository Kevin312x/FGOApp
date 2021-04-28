const express = require('express');
const database_manager = require('../../../database/database-manager.js');
const passport_config = require('../../../modules/passport.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/register', passport_config.already_auth, (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;

  if(username == username.replace(/[^A-Za-z0-9]/gi,'')) {
    const user_username = await database_manager.queryDatabase(`
      SELECT user_id FROM users 
      WHERE username = :username;`, 
    {
      username: username
    });

    const user_email = await database_manager.queryDatabase(`
      SELECT user_id FROM users 
      WHERE email = :email;`, 
    {
      email: email
    });

    if(user_username.length == 0) {
      if(user_email.length == 0) {
        if(req.body.password.length >= 6 && req.body.password.length <= 15) {
          if(req.body.password == req.body['conf-password']) {
            try {
              let hash_pass = await bcrypt.hash(req.body.password, 10);
              await database_manager.queryDatabase(`START TRANSACTION;`);  
              await database_manager.queryDatabase(`
                INSERT INTO users 
                (username, password, email) 
                VALUES (:username, :password, :email);`, 
              {
                username: username, 
                password: hash_pass, 
                email:    email
              });
              await database_manager.queryDatabase(`COMMIT;`);
              res.redirect('/');
              return;
            }
            catch(err) {
              await database_manager.queryDatabase(`ROLLBACK;`);
              console.log('Rolling back at register.', err);
            }
          } else {
            req.flash('error', 'Password does not match.');
          }
        } else {
          req.flash('error', 'Password length must be between 6 and 15 characters');
        }
      } else {
        req.flash('error', 'Email already exists.');
      }
    } else {
      req.flash('error', 'Username already exists.');
    }
  } else {
    req.flash('error', 'Username contains invalid characters.');
  }

  res.redirect('/register');
});

module.exports = router;