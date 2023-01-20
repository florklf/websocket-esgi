const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('@prisma/client/runtime');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const userFields = {
    id: true,
    username: true,
    role_id: true,
    status: true,
    updated_at: true,
    created_at: true,
}

exports.getUsers = async (req, res, next) => {
    try {
        let users = null;
        if (req.query) {
            users = await prisma.user.findMany({
                where: req.query,
                select: userFields,
            });
        } else {
            users = await prisma.user.findMany({
                select: userFields,
            });
        }
        res.status(200).json(users);
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId }, select: userFields });
        res.status(200).json({ user });
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}

exports.getCurrentUser = async (req, res, next) => {
    const token = req.cookies?.token || '';
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUniqueOrThrow({
            where: { username: decoded.username },
            select: userFields,
        });
        res.status(200).json(user);
    } catch (e) {
        if (e instanceof NotFoundError) {
            res.status(401).json({ message: 'Account not found' });
        } else {
            res.status(401).json({ message: e.message });
        }
    }
}