const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getAll = async (req, res, next) => {
    try {
        const requests = await prisma.pendingRequest.findMany({
            where: {
                OR: [
                    { status: 'pending' },
                ]
            },
            select: {
                id: true,
                user_id: true,
                status: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role_id: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            },
        });
        res.status(200).json(requests);
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}