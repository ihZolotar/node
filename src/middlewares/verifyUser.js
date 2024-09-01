const userModel = require('../models/userModel');
const httpStatus = require('../enums/httpStatusCodes');

const findUserById = async id => userModel.findById(id).select('-password');

// const handleError = (res, err, status = httpStatus.INTERNAL_SERVER_ERROR) =>
//   res.status(status).send({ error: err.message });

const handleError = (res, err, status = httpStatus.INTERNAL_SERVER_ERROR) => {
  console.error(err); // Додаємо логування помилок
  res.status(status).send({ error: err.message });
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send('User not found');
    }

    req.userData = user;

    return next();
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = verifyUser;
