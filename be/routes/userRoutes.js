const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/increment', userController.userIncrement);

module.exports = router;