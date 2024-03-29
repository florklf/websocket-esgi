const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');


router.get('/', conversationController.getAll);
router.get('/:id', conversationController.getConversation);
router.get('/user/:id', conversationController.getUserConversations);
router.post('/', conversationController.createConversation);
router.put('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);
module.exports = router;