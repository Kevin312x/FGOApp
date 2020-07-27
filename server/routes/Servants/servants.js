const express = require('express');
const router = express.Router()

router.get('/servants/class/:class', (req, res) => {
  res.render('servants');
});

router.post('/servants/class/:class', (req, res) => {

});

router.get('/servants/id/:id', (req, res) => {
  res.render('servants');
});

router.post('/servants/id/:id', (req, res) => {

});

module.exports = router;