const express = require('express');
const router = express.Router()

router.get('/servant', (req, res) => {
  res.render('servants');
});

router.post('/servant', (req, res) => {

});

router.patch('/servant', (req, res) => {

});

router.delete('/servant', (req, res) => {

});

module.exports = router;