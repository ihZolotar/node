const jwt = require('jsonwebtoken');
const moment = require('moment');
const RefreshToken = require('../models/refreshTokenModel');

const generateAccessToken = user =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );

const generateRefreshToken = async user => {
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '30d',
    },
  );

  const newRefreshToken = new RefreshToken({
    token: refreshToken,
    user: user.id,
    expiryDate: moment().add(30, 'd').toDate(),
  });

  await newRefreshToken.save();

  return refreshToken;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
