const databaseManager = require('../database/database-manager.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

/**
 * Checks if given crendentials are valid.
 * If so, return the user.
 */
function passport_config(passport) {
  const user_auth = async (username, password, done) => {
    const user_prms = databaseManager.queryDatabase(`
      SELECT user_id, username FROM users 
      WHERE username = :username 
      OR email = :username;`, 
    {
      username: username
    });

    const user_pw_prms = databaseManager.queryDatabase(`
      SELECT password FROM users 
      WHERE username = :username 
      OR email = :username;`, 
    {
      username: username
    });
    
    [user, user_pw] = await Promise.all([user_prms, user_pw_prms]);
    if(user.length == 0) { return done(null, false, { message: "Username or email does not exist." }); }
    if(await bcrypt.compare(password, user_pw[0]['password'])) { return done(null, user[0]); }
    else { return done(null, false, { message: "Incorrect password." }); }
  }

  passport.use(new LocalStrategy({ 
    usernameField: 'username',
    passwordField: 'password'
   }, user_auth));
  passport.serializeUser((user, done) => { done(null, user); });
  passport.deserializeUser((id, done) => { done(null, id); }); 
}

/**
 * Checks if the user is authenticated.
 * If so, move to next middleware, else return.
 * @param req: Request object
 * @param res: Response object
 * @param next: Function to move to next middleware
 * @returns: Nothing
 */
function check_auth(req, res, next) {
  if(req.isAuthenticated()) { return next(); }
  else {
    res.redirect('/');
    return;
  }
}

/**
 * Checks if the user is authenticated.
 * If so, return, else move to next middleware.
 * @param req: Request object
 * @param res: Response object
 * @param next: Function to move to next middleware
 * @returns: Nothing
 */
function already_auth(req, res, next) {
  if(!req.isAuthenticated()) { return next(); }
  else {
    res.redirect('/');
    return;
  }
}

module.exports.passport_config = passport_config;
module.exports.check_auth = check_auth;
module.exports.already_auth = already_auth;