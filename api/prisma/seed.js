const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  // Ajoute une conversation entre 2 utilisateurs
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

  // Ajoute 5 salons de discussions
  await prisma.conversation.createMany({
    data: [
      { name: 'Salon 1', type: 'group', max_users: 5 },
      { name: 'Salon 2', type: 'group', max_users: 6 },
      { name: 'Salon 3', type: 'group', max_users: 7 },
      { name: 'Salon 4', type: 'group', max_users: 8 },
      { name: 'Salon 5', type: 'group', max_users: 10 },
    ],
  })

  // Ajoute 3 utilisateurs
  await prisma.user.createMany({
    data: [
      { username: 'user3', password: bcrypt.hashSync('user3', 8), role: 'admin', role_id: 2 },
      { username: 'user4', password: bcrypt.hashSync('user4', 8) },
      { username: 'user5', password: bcrypt.hashSync('user5', 8), role: 'admin', role_id: 2 },
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
