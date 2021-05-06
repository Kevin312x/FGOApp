const express = require('express');
const router = express.Router();

router.get('profile', (req, res, next) => {
  const error = new Error;

  res.status(200).render('user_profile', {});

  error.message = 'Bad Request';
  error.status = 400;
  next(error);
});