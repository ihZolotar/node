const jwt = require('jsonwebtoken');
const moment = require('moment');
const RefreshToken = require('../src/models/refreshTokenModel');
const { generateAccessToken, generateRefreshToken } = require('../src/services/tokenService');

jest.mock('jsonwebtoken');
jest.mock('moment');
jest.mock('../src/models/refreshTokenModel');

describe('Token Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token for the user', () => {
      const user = { id: '1', email: 'test@example.com' };
      jwt.sign.mockReturnValue('accessToken');

      const token = generateAccessToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
      );
      expect(token).toBe('accessToken');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token for the user and save it', async () => {
      const user = { id: '1', email: 'test@example.com' };
      jwt.sign.mockReturnValue('refreshToken');
      const mockDate = new Date();
      const momentMock = jest.fn().mockReturnValue({
        add: jest.fn().mockReturnValue({ toDate: jest.fn().mockReturnValue(mockDate) }),
      });
      moment.mockImplementation(momentMock);
      const mockSave = jest.fn();
      RefreshToken.mockImplementation(() => ({ save: mockSave }));

      const token = await generateRefreshToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' },
      );
      expect(RefreshToken).toHaveBeenCalledWith({
        token: 'refreshToken',
        user: user.id,
        expiryDate: mockDate,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(token).toBe('refreshToken');
    });
  });
});
