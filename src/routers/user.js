const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.get('/login', userController.showLogin);
router.post('/signup', userController.signup);
router.get('/signup', userController.showSignup);

module.exports = router;
