const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getUsers);
router.get('/me', userController.getCurrentUser);
router.get('/:userId', userController.getUser);

module.exports = router;