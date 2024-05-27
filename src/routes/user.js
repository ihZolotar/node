const express = require('express');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const userModel = require('../models/userModel');

const router = express.Router();

const HTTP_STATUS_NOT_FOUND = 400;
const HTTP_STATUS_SUCCESS = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const HTTP_STATUS_BAD_REQUEST = 404;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get('/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const items = await userModel.find();

    return res.status(HTTP_STATUS_SUCCESS).json(items);
  } catch (err) {
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ error: err.message });
  }
});

router.put(
  '/profile/avatar',
  passport.authenticate('jwt', { session: false }),
  upload.single('avatar'),
  async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);

      if (!user) {
        return res.status(HTTP_STATUS_NOT_FOUND).send('User not found');
      }

      user.avatar = req.file.filename;
      await user.save();

      return res.status(HTTP_STATUS_SUCCESS).send({
        message: 'Avatar updated successfully',
      });
    } catch (err) {
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  },
);

router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send('User not found');
    }

    return res.status(HTTP_STATUS_SUCCESS).json(user);
  } catch (err) {
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ error: err.message });
  }
});

router.get(
  '/profile/avatar',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);

      if (!user) {
        return res.status(HTTP_STATUS_NOT_FOUND).send('User not found');
      }

      let avatarPath = path.join(__dirname, '../../public/images', 'avatar.webp');

      if (req.user.avatar) {
        const pathAvatar = path.join(__dirname, '../../uploads', req.user.avatar);
        if (fs.existsSync(pathAvatar)) {
          avatarPath = pathAvatar;
        }
      }

      if (fs.existsSync(avatarPath)) {
        const readStream = fs.createReadStream(avatarPath);
        return readStream.pipe(res);
      }

      return res.status(HTTP_STATUS_BAD_REQUEST).send('File not found');
    } catch (err) {
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  },
);

module.exports = router;
