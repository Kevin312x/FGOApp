const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;

  try { var hash_pass = await bcrypt.hash(req.body.password, 10); }
  catch { return res.status(404).send({'error': {'401': 'Unauthorized', 'description': 'Sorry, wrong username or password.'}}); }

  console.log(hash_pass)
});

module.exports = router;