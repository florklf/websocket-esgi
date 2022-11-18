const dotenv = require('dotenv').config();
const express = require('express');
const cookies = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const httpServer = http.createServer(app);
// const server = http.createServer(app);
// const io = new Server(server);
// const io = require('socket.io')(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//   },
// });
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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Routes
const router = express.Router();
app.use('/api', router);
require('./routes')(router);

httpServer.listen(3000, () => {
  console.log('Server started on port 3000');
});
