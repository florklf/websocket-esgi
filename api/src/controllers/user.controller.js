const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('@prisma/client/runtime');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');


exports.getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.status(200).json({ user });
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}

exports.getCurrentUser = async (req, res, next) => {
    const token = req.cookies?.token || '';
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUniqueOrThrow({ where: { username: decoded.username } });
        res.status(200).json(user);
    } catch (e) {
        if (e instanceof NotFoundError) {
            res.status(401).json({ message: 'Account not found'});
        } else {
            res.status(401).json({ message: e.message});
        }
    }
}