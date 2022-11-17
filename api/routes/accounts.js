/*
    Used in "/login" router
*/
const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nextTick } = require('vue');

module.exports = (app) => {
  const db = pgp({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
  });

  app.post('/login', (req, res, next) => {
    const username = req.body.username || '';

    db.one('SELECT * FROM users WHERE username = $1', username)
      .then((user) => {
        const { password } = req.body;
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            const token = jwt.sign(
              { username },
              process.env.JWT_SECRET,
              { expiresIn: '1h' },
            );
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json({
              message: 'Authentication successful',
            });
          } else {
            res.status(401).json({
              message: 'Account not found',
            });
          }
        });
      })
      .catch((error) => {
        console.log('coucou');
        console.log(error);
        res.status(401).json({
          message: 'Account not found',
        });
        // next(error);
      });
  });

  app.get('/auth', (req, res) => {
    const token = req.cookies?.token || '';
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        res.status(401).json({
          message: 'Unauthorized',
        });
      } else {
        res.status(200).json({
          message: 'Authorized',
        });
      }
    });
  });
};
