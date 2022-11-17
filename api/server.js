const dotenv = require('dotenv').config();
const express = require('express');
const cookies = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookies());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Content-Type', 'application/json');
  next();
});

// Routes
const router = express.Router();
app.use('/api', router);
require('./routes')(router);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
