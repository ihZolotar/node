const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/profile', (req, res) => {
  res.render('profile');
});

router.get('/logout', (req, res) => {
  res.render('logout');
});

module.exports = router;
