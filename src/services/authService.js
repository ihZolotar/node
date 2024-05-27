const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const { generateAccessToken, generateRefreshToken } = require('./tokenService');

const register = async ({ email, name, age, password }) => {
  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
    age,
  });

  const accessToken = await generateAccessToken(newUser);
  const refreshToken = await generateRefreshToken(newUser);

  return {
    email: newUser.email,
    userId: newUser.id,
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const foundUser = await userModel.findOne({ email });

  if (!foundUser) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(foundUser);
  const refreshToken = await generateRefreshToken(foundUser);

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async ({ token }) => {
  if (!token) {
    throw new Error('Unauthorized');
  }

  const storedToken = await refreshTokenModel.findOne({ token });

  if (!storedToken || storedToken.expiryDate < new Date()) {
    throw new Error('Forbidden');
  }

  const user = jwt.verify(storedToken.token, process.env.REFRESH_TOKEN_SECRET);
  const accessToken = generateAccessToken(user);

  return { accessToken };
};

const logout = async userId => {
  await refreshTokenModel.deleteMany({ user: userId });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
