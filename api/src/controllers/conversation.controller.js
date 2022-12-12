const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('@prisma/client/runtime');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');


exports.getAll = async (req, res, next) => {
    try {
        const conversations = await prisma.conversation.findMany();
        res.status(200).json(conversations);
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}

exports.getConversations = async (req, res, next) => {
    try {
        const { id } = req.params;
        // console.log(id);
        const user = await prisma.user.findUnique({ where: { id: id } });
        res.status(200).json({ user });
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}

exports.getUserConversations = async (req, res, next) => {
    const { id } = parseInt(req.params);
    try {
        const conversations = await prisma.conversation.findMany({
            where: { users: { some: { id: id } } }},
            { include: { users: true, messages: true } }
            );
        res.status(200).json(conversations);
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}