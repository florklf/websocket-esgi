const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.createMany({
    data: [
      { name: 'user'},
      { name: 'admin'},
    ],
  });
  const conv = await prisma.conversation.create({
    data: {
      users: {
        create: [
          { username: 'user1', password: bcrypt.hashSync('user1', 8) }, { username: 'user2', password: bcrypt.hashSync('user2', 8) }
        ]
      },
    }
  });
  await prisma.conversation.update({
    where: {
      id: conv.id,
    },
    data: {
      messages: {
        create: [
          { content: 'Hello World', user: { connect: { username: 'user1' } } }, { content: 'Hello World', user: { connect: { username: 'user2' } } }
        ]
      },
    },
  });
  await prisma.user.createMany({
    data: [
      { username: 'user3', password: bcrypt.hashSync('user3', 8) },
      { username: 'user4', password: bcrypt.hashSync('user4', 8) },
      { username: 'user5', password: bcrypt.hashSync('user5', 8) },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });