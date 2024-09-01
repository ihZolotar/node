const fs = require('fs');
const path = require('path');
const httpStatus = require('../enums/httpStatusCodes');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

const handleError = (res, err, status = httpStatus.INTERNAL_SERVER_ERROR) =>
  res.status(status).send({ error: err.message });

const deleteOldAvatar = avatarPath => {
  if (fs.existsSync(avatarPath)) {
    fs.unlinkSync(avatarPath);
  }
};

const uploadAvatarHandler = async (req, res) => {
  try {
    const user = req.userData;

    if (user.avatar) {
      deleteOldAvatar(path.join(UPLOADS_DIR, user.avatar));
    }

    user.avatar = req.file.filename;
    await user.save();

    return res.status(httpStatus.OK).send({ message: 'Avatar updated successfully' });
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = uploadAvatarHandler;
