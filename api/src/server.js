const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const cookies = require('cookie-parser');
const { Server } = require('socket.io');
const https = require('https');
const fs = require('fs');
const routes = require('./routes');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Certificate
var options = {
  key: fs.readFileSync(`${process.env.CERTBOT_PATH}/privkey.pem`),
  cert: fs.readFileSync(`${process.env.CERTBOT_PATH}/fullchain.pem`)
};

const app = express();
const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? `${process.env.BASE_URL}` : 'http://localhost:5173',
  },
});

app.use(express.json());
app.use(cookies());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? `${process.env.BASE_URL}` : 'http://localhost:5173')
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Content-Type', 'application/json');
  next();
});

io.use((socket, next) => {
  socket.username = socket.handshake.auth.username;
  socket.id = socket.handshake.auth.id;
  socket.role = socket.handshake.auth.role;
  socket.status = socket.handshake.auth.status;
  next();
});

io.on('connection', async (socket) => {
  console.log(`user ${socket.id} connected, there is ${io.engine.clientsCount} users connected`);
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.role === 'admin' && socket.status === 'active') {
      socket.join('adviser');
    }
    users.push({
      userID: socket.id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join conversation', (conversation) => {
    socket.join(`room_${conversation}`);
  });

  socket.on('leave conversation', (conversation) => {
    socket.leave(conversation);
  });

  socket.on("private message", ({ content, conversation_id }) => {
    prisma.conversation.update({
      where: {
        id: parseInt(conversation_id)
      },
      select: {
        messages: {
          select: {
            content: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        }
      },
      data: {
        users: {
          connect: {
            id: socket.id
          },
        },
        messages: {
          create: {
            user_id: socket.id,
            content,
          },
        }
      }
    }).then((message) => {
      socket.broadcast.emit('user joined');
      prisma.conversation.findUnique({
        where: { id: parseInt(conversation_id) },
        include: { users: true },
      }).then((conversation) => {
        const toUsers = conversation.users.filter((user) => user.id !== socket.id).map((user) => user.id);
        if (!toUsers.length) return;
        io.to(toUsers).emit('message received', { content, conversation });
        io.to(toUsers).emit('notification', { type: conversation.type, content, from: socket.handshake.auth, to: conversation.name ?? '' });
      });
    });
  });

  socket.on('ask adviser', async (user_id) => {
    const pendingRequests = await prisma.pendingRequest.findMany({
      where: {
        user_id,
        status: 'pending',
      },
    });
    if (pendingRequests.length > 0) {
      io.to(user_id).emit('request sent', { state: 'already_sent' });
      return;
    }
    const activeAdvisers = await io.in("adviser").fetchSockets();  
    if (!activeAdvisers.length) {
      io.to(user_id).emit('request sent', { state: 'no_adviser' });
      return;
    }
    const pendingRequest = await prisma.pendingRequest.create({
      data: {
        user_id,
        status: 'pending',
      },
      include: { user: true },
    });
    if (pendingRequest) {
      io.to(user_id).emit('request sent', { state: 'sent' });
      io.to(activeAdvisers.map(adviser => adviser.id)).emit('ask adviser', { pendingRequest }); 
    }
  });

  socket.on('reject request', (request_id) => {
    prisma.pendingRequest.update({
      where: { id: parseInt(request_id) },
      data: {
        status: 'rejected',
      },
      include: { user: true },
    }).then((pendingRequest) => {
      io.to(pendingRequest.user.id).emit('reject request', { from_username: socket.username });
    });
  });

  socket.on('accept request', async (request_id) => {
    try {
      const pendingRequest = await prisma.pendingRequest.update({
        where: { id: parseInt(request_id) },
        data: {
          status: 'accepted',
        },
        include: { user: true },
      });
      let conv = await prisma.conversation.findFirst({
        where: {
          type: 'private',
          AND: [
            {
              users: {
                some: {
                  id: socket.id
                },
              },
            },
            {
              users: {
                some: {
                  id: pendingRequest.user.id
                },
              },
            },
          ]
        },
        include: {
          users: true,
          messages: true,
        },
      });
      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            type: 'private',
            users: {
              connect: [
                {id: socket.id},
                {id: pendingRequest.user.id},
              ],
            },
          },
          include: {
            users: true,
            messages: true,
          },
        });
      }
      io.to(pendingRequest.user.id).emit('accept request', { from_user: socket.handshake.auth, conversation: conv });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('toggle user status', (user) => {
    prisma.user.update({
      where: { id: parseInt(user.id) },
      data: {
        status: user.status === 'active' ? 'inactive' : 'active',
      },
    }).then((user) => {
      socket.emit('toggle user status', { status: user.status });
      user.status === 'active' ? socket.join('adviser') : socket.leave('adviser');
    });
  });

  socket.on('commercial notification', (message) => {
    socket.broadcast.emit('commercial notification', message);
  });

  socket.on('updated conversation', (conversation) => {
    socket.broadcast.emit('updated conversation', conversation);
  });
  socket.on('deleted conversation', (conversation) => {
    socket.broadcast.emit('deleted conversation', conversation);
  });
});

app.use('/api', routes);

httpsServer.listen(443, () => {
  console.log('Server started on port 443');
});

module.exports = { app, io };