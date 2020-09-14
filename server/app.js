const express = require('express');
const app = express();
const path = require('path');
const public_path = path.join(__dirname, '/public');

const index_router = require('./routes/index.js');
const servants_router = require('./routes/Servants/servants.js');
const ce_router = require('./routes/Craft Essences/craftessence.js');
const sqcalc_router = require('./routes/Calculators/sqcalc.js');
const dmgcalc_router = require('./routes/Calculators/dmgcalc.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(public_path));
app.set('view engine','ejs');

app.use(index_router);
app.use(servants_router);
app.use(ce_router);
app.use(sqcalc_router);
app.use(dmgcalc_router);

app.listen(3000, () => {
  console.log("Listening on port 3000.");
})