const dotenv = require('dotenv').config();
const express = require('express');
const cookies = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');
const routes = require('./routes');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.use(express.json());
app.use(cookies());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Content-Type', 'application/json');
  next();
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const id = socket.handshake.auth.id;
  socket.username = username;
  socket.id = id;
  socket.role = socket.handshake.auth.role;
  next();
});

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected, there is ${io.engine.clientsCount} users connected`);
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.role === 'admin') {
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
      io.in(`room_${conversation_id}`).emit("private message", { content: message.messages[0].content, from: socket.id });
      prisma.conversation.findUnique({
        where: { id: parseInt(conversation_id) },
        include: { users: true },
      }).then((conversation) => {
        const toUsers = conversation.users.filter((user) => user.id !== socket.id).map((user) => user.id);
        io.to(toUsers).emit('notification', { type: conversation.type, content, from: socket.handshake.auth, to: conversation.name ?? '' });
      });
    });
  });

  socket.on('ask adviser', (user_id) => {
    prisma.pendingRequest.findMany({
      where: {
        user_id,
        status: 'pending',
      },
    }).then((pendingRequests) => {
      if (pendingRequests.length > 0) {
        return;
      }
      prisma.user.findMany({
        where: { status: 'active', role: 'admin', },
      }).then((users) => {
        if (users.length === 0) {
          io.to(user_id).emit('no adviser');
          return;
        }
        prisma.pendingRequest.create({
          data: {
            status: 'pending',
            user_id,
          },
          include: { user: true },
        }).then((pendingRequest) => {
          io.to('adviser').emit('ask adviser', { pendingRequest });
        });
      });
    });
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

  socket.on('accept request', (request_id) => {
    prisma.pendingRequest.update({
      where: { id: parseInt(request_id) },
      data: {
        status: 'accepted',
      },
      include: { user: true },
    }).then((pendingRequest) => {
      io.to(pendingRequest.user.id).emit('accept request', { from_user: socket.handshake.auth });
    });
  });

  socket.on('toggle user status', (user) => {
    prisma.user.update({
      where: { id: parseInt(user.id) },
      data: {
        status: user.status === 'active' ? 'inactive' : 'active',
      },
    }).then((user) => {
      socket.emit('toggle user status', { status: user.status });
    });
  });

  socket.on('commercial notification', (message) => {
    socket.broadcast.emit('commercial notification', message);
  });
});

app.use('/api', routes);

httpServer.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = { app, io };