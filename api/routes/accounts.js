/*
    Used in "/login" router
*/
module.exports = function (app) {
    const pgp = require('pg-promise')(/*options*/);
    const db = pgp({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false,
    });

    app.post('/login', function (req, res) {
        const username = req.body.username;

        db.one('SELECT * FROM users WHERE username = $1', username)
            .then(function (user) {
                const bcrypt = require('bcrypt');
                const password = req.body.password;
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        const jwt = require('jsonwebtoken');
                        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                        res.cookie('token', token, { httpOnly: true });
                        res.status(200).json({
                            message: 'Authentication successful',
                        });
                    } else {
                        res.status(401).json({
                            message: 'Authentication failed'
                        });
                        res.status(200).send({
                            message: 'Authentication successful!',
                        });
                    }
                });
            })
            .catch(function (error) {
                console.log(error)
                res.send({
                    message: 'Unauthorized',
                });
            });
    });
}