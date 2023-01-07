const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');


router.post('/conversations', chatbotController.chatbotConversation);
module.exports = router;