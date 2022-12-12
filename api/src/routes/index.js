const express = require('express');
const users = require('./users');
const conversations = require('./conversations');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.get('/auth', authController.isAuth);
router.get('/logout', authController.logout);

router.use('/users', users);
router.use('/conversations', conversations);

module.exports = router;