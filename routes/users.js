const express = require('express');
const userModel = require('../models/userModel');

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res) => {
  const items = await userModel.find();
  res.json(items);
});

module.exports = router;
