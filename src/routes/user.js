const express = require('express');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const userModel = require('../models/userModel');
const httpStatus = require('../enums/httpStatusCodes');

const router = express.Router();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const authenticate = passport.authenticate('jwt', { session: false });

const handleError = (res, err, status = httpStatus.INTERNAL_SERVER_ERROR) =>
  res.status(status).send({ error: err.message });

const findUserById = async id => userModel.findById(id).select('-password');

const deleteOldAvatar = avatarPath => {
  if (fs.existsSync(avatarPath)) {
    fs.unlinkSync(avatarPath);
  }
};

router.get('/all', authenticate, async (req, res) => {
  try {
    const items = await userModel.find();
    return res.status(httpStatus.OK).json(items);
  } catch (err) {
    return handleError(res, err);
  }
});

router.put('/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send('User not found');
    }

    if (user.avatar) {
      deleteOldAvatar(path.join(UPLOADS_DIR, user.avatar));
    }

    user.avatar = req.file.filename;
    await user.save();

    return res.status(httpStatus.OK).send({ message: 'Avatar updated successfully' });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send('User not found');
    }

    return res.status(httpStatus.OK).json(user);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get('/profile/avatar', authenticate, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send('User not found');
    }

    let avatarPath = path.join(__dirname, '../../public/images', 'avatar.webp');

    if (user.avatar) {
      const pathAvatar = path.join(UPLOADS_DIR, user.avatar);
      if (fs.existsSync(pathAvatar)) {
        avatarPath = pathAvatar;
      }
    }

    if (fs.existsSync(avatarPath)) {
      const readStream = fs.createReadStream(avatarPath);
      return readStream.pipe(res);
    }

    return res.status(httpStatus.BAD_REQUEST).send('File not found');
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
