const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');


router.get('/', conversationController.getAll);
router.get('/:id', conversationController.getUserConversations);

module.exports = router;