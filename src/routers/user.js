const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.get('/login', userController.showLogin);
router.post('/signup', userController.signup);
router.get('/signup', userController.showSignup);
router.post('/logout', auth, userController.logout);
router.get('/profile/:usr', userController.showProfile);
router.get('/profile', auth, userController.showProfileSelf);

module.exports = router;
