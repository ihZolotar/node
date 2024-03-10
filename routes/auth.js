const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  // Тут ви повинні зберегти користувача в базі даних
  // Припустимо, що користувач успішно збережений

  res.status(201).send({ username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Тут ви повинні знайти користувача в базі даних
  // Припустимо, що користувач знайдений і його збережений пароль hashedPassword

  const passwordIsValid = await bcrypt.compare(password, hashedPassword);

  if (!passwordIsValid) return res.status(401).send('Password is not valid');

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: 86400 // 24 години
  });

  res.status(200).send({ auth: true, token });
});


module.exports = router;
