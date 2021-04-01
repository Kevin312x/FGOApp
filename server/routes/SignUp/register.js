const express = require('express');
const database_manager = require('../../database/database-manager.js');
const router = express.Router()

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  console.log(req.body)
});

module.exports = router;