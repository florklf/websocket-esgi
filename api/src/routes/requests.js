const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');


router.get('/', requestController.getAll);

module.exports = router;