const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('@prisma/client/runtime');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUniqueOrThrow({ where: { username: username } });
        const result = await bcrypt.compare(password, user.password);
        if (!result) throw new Error('Incorrect password');
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Authentication successful'});
    } catch (e) {
        if (e instanceof NotFoundError) {
        res.status(401).json({ message: 'Account not found'});
        } else if (e instanceof Error) {
        res.status(401).json({ message: e.message});
        }
    }
};

exports.isAuth = async (req, res) => {
    const token = req.cookies?.token || '';
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Authorized', decoded });
    } catch (e) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

exports.logout = async (req, res) => {
    console.log(res.clearCookie('token', { httpOnly: true }));
    res.status(200).json({ message: 'Logout successful' });
};