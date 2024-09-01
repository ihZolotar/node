const fs = require('fs');
const path = require('path');
const httpStatus = require('../src/enums/httpStatusCodes');
const uploadAvatarHandler = require('../src/services/avatarService');

jest.mock('fs');
jest.mock('path');
jest.mock('../src/enums/httpStatusCodes', () => ({
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
}));

describe('uploadAvatarHandler', () => {
  let req;
  let res;
  let user;

  beforeEach(() => {
    req = {
      userData: {
        save: jest.fn().mockResolvedValue(true),
        avatar: 'oldAvatar.png',
      },
      file: {
        filename: 'newAvatar.png',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    user = req.userData;

    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => {});
    path.join.mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete old avatar if it exists', async () => {
    const expectedPath = 'uploads/oldAvatar.png';
    path.join.mockReturnValue(expectedPath);

    await uploadAvatarHandler(req, res);

    expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    expect(fs.unlinkSync).toHaveBeenCalledWith(expectedPath);
  });

  it('should update user avatar and save the user', async () => {
    await uploadAvatarHandler(req, res);

    expect(user.avatar).toBe('newAvatar.png');
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.send).toHaveBeenCalledWith({ message: 'Avatar updated successfully' });
  });

  it('should handle errors and send error response', async () => {
    const error = new Error('Test error');
    user.save.mockRejectedValue(error);

    await uploadAvatarHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith({ error: error.message });
  });

  it('should not delete old avatar if user does not have one', async () => {
    req.userData.avatar = null;
    fs.existsSync.mockReturnValue(false);

    await uploadAvatarHandler(req, res);

    expect(fs.existsSync).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(user.avatar).toBe('newAvatar.png');
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.send).toHaveBeenCalledWith({ message: 'Avatar updated successfully' });
  });
});
