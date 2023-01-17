const express = require('express');
const users = require('./users');
const conversations = require('./conversations');
const chatbot = require('./chatbot');
const authController = require('../controllers/auth.controller');
const notificationController = require('../controllers/notification.controller');
const requests = require('./requests');

const router = express.Router();

router.post('/login', authController.login);
router.get('/auth', authController.isAuth);
router.get('/logout', authController.logout);

router.post('/notification', notificationController.postNotification);
router.get('/notification', notificationController.getNotification);

router.use('/users', users);
router.use('/conversations', conversations);
router.use('/chatbot', chatbot);
router.use('/requests', requests);


module.exports = router;