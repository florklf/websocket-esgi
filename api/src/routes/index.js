const express = require('express');
const users = require('./users');
const conversations = require('./conversations');
const chatbot = require('./chatbot');
const authController = require('../controllers/auth.controller');
const requests = require('./requests');

const router = express.Router();

router.post('/login', authController.login);
router.get('/auth', authController.isAuth);
router.get('/logout', authController.logout);

router.use('/users', users);
router.use('/conversations', conversations);
router.use('/chatbot', chatbot);
router.use('/requests', requests);


module.exports = router;