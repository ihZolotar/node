const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../src/models/userModel');
const refreshTokenModel = require('../src/models/refreshTokenModel');
const { generateAccessToken, generateRefreshToken } = require('../src/services/tokenService');
const { register, login, refreshToken, logout } = require('../src/services/authService');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/models/userModel');
jest.mock('../src/models/refreshTokenModel');
jest.mock('../src/services/tokenService');

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test',
        age: 25,
        password: 'password123',
      };
      userModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      userModel.create.mockResolvedValue({ id: '1', ...userData, password: 'hashedPassword' });
      generateAccessToken.mockResolvedValue('accessToken');
      generateRefreshToken.mockResolvedValue('refreshToken');

      const result = await register(userData);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({ ...userData, password: 'hashedPassword' });
      expect(generateAccessToken).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
      expect(generateRefreshToken).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
      expect(result).toEqual({
        email: userData.email,
        userId: '1',
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw an error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test',
        age: 25,
        password: 'password123',
      };
      userModel.findOne.mockResolvedValue({ email: userData.email });

      await expect(register(userData)).rejects.toThrow('Email already exists');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const foundUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      userModel.findOne.mockResolvedValue(foundUser);
      bcrypt.compare.mockResolvedValue(true);
      generateAccessToken.mockReturnValue('accessToken');
      generateRefreshToken.mockResolvedValue('refreshToken');

      const result = await login(userData);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, foundUser.password);
      expect(generateAccessToken).toHaveBeenCalledWith(foundUser);
      expect(generateRefreshToken).toHaveBeenCalledWith(foundUser);
      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
    });

    it('should throw an error if user is not found', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      userModel.findOne.mockResolvedValue(null);

      await expect(login(userData)).rejects.toThrow('User not found');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should throw an error if password is invalid', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const foundUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      userModel.findOne.mockResolvedValue(foundUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(login(userData)).rejects.toThrow('Invalid credentials');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, foundUser.password);
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token', async () => {
      const tokenData = { token: 'refreshToken' };
      const storedToken = { token: 'refreshToken', expiryDate: new Date(Date.now() + 10000) };
      refreshTokenModel.findOne.mockResolvedValue(storedToken);
      jwt.verify.mockReturnValue({ id: '1', email: 'test@example.com' });
      generateAccessToken.mockReturnValue('newAccessToken');

      const result = await refreshToken(tokenData);

      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({ token: tokenData.token });
      expect(jwt.verify).toHaveBeenCalledWith(storedToken.token, process.env.REFRESH_TOKEN_SECRET);
      expect(generateAccessToken).toHaveBeenCalledWith({ id: '1', email: 'test@example.com' });
      expect(result).toEqual({ accessToken: 'newAccessToken' });
    });

    it('should throw an error if token is not provided', async () => {
      await expect(refreshToken({})).rejects.toThrow('Unauthorized');
    });

    it('should throw an error if token is not found or expired', async () => {
      const tokenData = { token: 'refreshToken' };
      refreshTokenModel.findOne.mockResolvedValue(null);

      await expect(refreshToken(tokenData)).rejects.toThrow('Forbidden');

      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({ token: tokenData.token });
    });
  });

  describe('logout', () => {
    it('should delete all refresh tokens for the user', async () => {
      const userId = '1';
      const deleteManyMock = jest.spyOn(refreshTokenModel, 'deleteMany').mockResolvedValue({});

      await logout(userId);

      expect(deleteManyMock).toHaveBeenCalledWith({ user: userId });
    });
  });
});
