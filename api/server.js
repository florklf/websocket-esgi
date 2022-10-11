const dotenv = require('dotenv').config()
const express = require('express');

const app = express();

app.use(express.json());

// Routes
const router = express.Router();
app.use('/api', router);
require('./routes')(router);

app.listen(3000, () => {
    console.log('Server started on port 3000');
});