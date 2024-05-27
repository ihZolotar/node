const express = require('express');
const passport = require('passport');

const { registerValidation, loginValidation } = require('../middlewares/validation');
const { handleErrors } = require('../middlewares/errorHandling');
const httpStatus = require('../enums/httpStatusCodes');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', registerValidation, handleErrors, async (req, res) => {
  try {
    const result = await authService.register(req.body);

    return res.status(httpStatus.CREATED).json(result);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

router.post('/login', loginValidation, handleErrors, async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.json(result);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

router.post('/token/refresh', async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body);

    return res.json(result);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await authService.logout(req.user.id);

    return res.send('Logout successful');
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

module.exports = router;
