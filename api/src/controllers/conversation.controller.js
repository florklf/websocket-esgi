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

exports.getConversation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(id) },
            include: { users: true, messages: true }
        });
        res.status(200).json(conversation);
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}

exports.getUserConversations = async (req, res, next) => {
    const { id } = parseInt(req.params);
    try {
        const conversations = await prisma.conversation.findMany({
            where: { users: { some: { id: id } } },
            include: { users: true, messages: true }
        });
        res.status(200).json(conversations);
    } catch (e) {
        res.status(401).json({ message: e.message});
    }
}