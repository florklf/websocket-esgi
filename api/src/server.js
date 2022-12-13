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
  res.header('Content-Type', 'application/json');
  next();
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const id = socket.handshake.auth.id;
  socket.username = username;
  socket.id = id;
  next();
});

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected, there is ${io.engine.clientsCount} users connected`);
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
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
    prisma.message.create({
      data: {
        user_id: socket.id,
        conversation_id,
        content,
      },
    }).then((message) => {
      io.in(`room_${conversation_id}`).emit("private message", { content: message.content, from: socket.id });
      prisma.conversation.findUnique({
        where: { id: parseInt(conversation_id) },
        include: { users: true },
      }).then((conversation) => {
        conversation.users.forEach((user) => {
          if (user.id !== socket.id) {
            io.to(user.id).emit('notification', { content, from_username: user.username, from_id: user.id });
          }
        });
      });
    });
  });
});

app.use('/api', routes);

httpServer.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = { app, io };