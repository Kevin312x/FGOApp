const express = require('express');
const app = express();
const path = require('path');
const public_path = path.join(__dirname, '/public');

const index_router = require('./routes/index.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(public_path));
app.set('view engine','ejs');
app.use(index_router)

app.listen(3000, () => {
  console.log("Listening on port 3000.");
})