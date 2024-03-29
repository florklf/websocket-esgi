const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');


exports.getAll = async (req, res, next) => {
    try {
        let conversations = null;
        if (req.query) {
            conversations = await prisma.conversation.findMany({
                where: req.query,
                include: {
                    messages: true,
                    users: true,
                },
            });
        } else {
            conversations = await prisma.conversation.findMany({
                include: {
                    messages: true,
                    users: true,
                },
            });
        }
        res.status(200).json(conversations);
    } catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
}

exports.getConversation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                created_at: true,
                updated_at: true,
                name: true,
                type: true,
                max_users: true,
                messages: {
                    orderBy: {
                        created_at: 'asc',
                    },
                    select: {
                        id: true,
                        conversation_id: true,
                        user_id: true,
                        content: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        username: true,
                        role_id: true,
                        status: true,
                        created_at: true,
                        updated_at: true,
                    }
                },
            },
        });
        res.status(200).json(conversation);
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}

exports.getUserConversations = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(401).json({ message: 'No id provided' });
    }
    try {
        const conversations = await prisma.conversation.findMany({
            where: { users: { some: { id: +id, }, }, },
            select: {
                id: true,
                name: true,
                type: true,
                max_users: true,
                created_at: true,
                updated_at: true,
                messages: {
                    orderBy: {
                        created_at: 'asc',
                    },
                    select: {
                        id: true,
                        conversation_id: true,
                        user_id: true,
                        content: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        username: true,
                        role_id: true,
                        status: true,
                        created_at: true,
                        updated_at: true,
                    }
                },
            },
        });
        res.status(200).json(conversations);
    } catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
}

exports.createConversation = async (req, res, next) => {
    const { users } = req.body;
    try {
        const conversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: users.map((userId) => ({ id: userId })),
                },
            },
            include: {
                users: true,
                messages: true,
            },
        });
        res.status(200).json(conversation);
    } catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
}

exports.updateConversation = async (req, res, next) => {
    // const { id } = req.body;
    try {
        const conversation = await prisma.conversation.update(
            {
                where: { id: parseInt(req.body.id) },
                data: req.body,
                include: {
                    users: true,
                    messages: true,
                },
            }
        );
        res.status(200).json(conversation);
    } catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
}

exports.deleteConversation = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.conversation.update({
            where: { id: parseInt(id) },
            data: {
                messages: {
                    deleteMany: {},
                },
            },
        });
        const conversation = await prisma.conversation.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json(conversation);
    } catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
}