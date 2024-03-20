const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { handleErrors } = require('../middlewares/errorHandling');

const router = express.Router();

router.post(
  '/register',
  registerValidation,
  handleErrors,
  async ({ body: { email, name, age, password } }, res) => {
    try {
      const existingUser = await userModel.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        age,
      });

      const userForToken = {
        id: newUser.id,
        email: newUser.email,
      };

      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return res.status(201).json({
        token,
        email: newUser.email,
        userId: newUser.id,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
);

router.post('/login', loginValidation, handleErrors, async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send('User not found');
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid credentials');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );

  return res.send({ token });
});

module.exports = router;
