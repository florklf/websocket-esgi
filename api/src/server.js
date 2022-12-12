const dotenv = require('dotenv').config();
const express = require('express');
const cookies = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');
const routes = require('./routes');

// const server = http.createServer(app);
// const io = new Server(server);
// const io = require('socket.io')(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//   },
// });
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

// io.use((socket, next) => {
//   const id = socket.handshake.auth.id;
//   if (id) {
//     // find existing session
//     const session = sessionStore.findSession(id);
//     if (session) {
//       socket.sessionID = sessionID;
//       socket.userID = session.userID;
//       socket.username = session.username;
//       return next();
//     }
//   }
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   // create new session
//   socket.sessionID = randomId();
//   socket.userID = randomId();
//   socket.username = username;
//   next();
// });

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const id = socket.handshake.auth.id;
  socket.username = username;
  socket.id = id;
  next();
});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(io.engine.clientsCount);
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: socket.id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  // join the "userID" room
  socket.join(socket.id);

  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', msg);
  });
  socket.on("private message", ({ content, to }) => {
    socket.to(to).to(socket.id).emit("private message", {
      content,
      from: socket.id,
      to,
    });
  });

  // const [sockets] = io.sockets;
  // console.log(sockets, 'lol');
  // sockets.forEach((id, s) => {
  //   users.push({
  //     userID: id,
  //     username: s.username,
  //   });
  // });
  // for (const [id, socket] of io.of('/').sockets) {

  // }
  // socket.emit('users', users);
  // // ...
});

app.use('/api', routes);

httpServer.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = {app, io};