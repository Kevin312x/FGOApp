const express = require('express');
const app = express();
const path = require('path');
const public_path = path.join(__dirname, '/public');
const flash = require('express-flash');
const session = require('express-session');

// initialise session middleware - flash-express depends on it
app.use(session({
  secret : "super secret! shhh",
  resave: false,
  saveUninitialized: true
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
const error_router = require('./routes/Errors/errors.js');
const register_router = require('./routes/SignUp/register.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(public_path));
app.set('view engine','ejs');

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
app.use(register_router);

app.use(error_router);

app.listen(3000, () => {
  console.log("Listening on port 3000.");
})