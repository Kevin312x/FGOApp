const express = require('express');
const router = express.Router();

router.get('*', (req, res) => {
  res.render('error', {'error': {'404': 'Not Found', 'description': 'Sorry, an error has occurred. Page not found.'}});
});

module.exports = router;