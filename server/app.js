const express = require('express');
const app = express();
const path = require('path');
const public_path = path.join(__dirname, '/public');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const verify_user_mw = require('./modules/is_logged_in.js');

// initialise session middleware - flash-express depends on it
app.use(session({
  secret : "super secret! shhh",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 5
  }
}));

// initialise the flash middleware
app.use(flash());

const index_router = require('./routes/index.js');
const servants_router = require('./routes/Servants/servants.js');
const ce_router = require('./routes/Craft Essences/craftessence.js');
const sqcalc_router = require('./routes/Calculators/sqcalc.js');
const dmgcalc_router = require('./routes/Calculators/dmgcalc.js');
const mc_router = require('./routes/Mystic Codes/mysticcodes.js');
const cc_router = require('./routes/Command Codes/commandcode.js');
const trait_router = require('./routes/Traits/trait.js');
const alignment_router = require('./routes/Alignments/alignments.js');
const attribute_router = require('./routes/Attributes/attributes.js');
const material_router = require('./routes/Materials/materials.js');
const login_router = require('./routes/Users/Login/login.js');
const signout_router = require('./routes/Users/SignOut/signout.js');
const register_router = require('./routes/Users/SignUp/register.js');
const profile_router = require('./routes/Users/Profile/profile.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(public_path));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());

app.use(verify_user_mw.is_logged_in);
app.use(index_router);
app.use(servants_router);
app.use(ce_router);
app.use(sqcalc_router);
app.use(dmgcalc_router);
app.use(mc_router);
app.use(cc_router);
app.use(trait_router);
app.use(alignment_router);
app.use(attribute_router);
app.use(material_router);
app.use(login_router);
app.use(signout_router);
app.use(register_router);
app.use(profile_router);

app.use((req, res, next) => {
  const error = new Error('Page not found.');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {'error': {status: error.status, message: (error.status != 500 ? error.message : `Something has gone wrong on the web site's server.`)}});
});

app.listen(3000, () => {
  console.log("Listening on port 3000.");
});