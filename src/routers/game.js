const express = require('express');
const Game = require('../models/game');
const auth = require('../middleware/auth');
const router = new express.Router();
const gameController = require('../controllers/gameController');

router.get('/games', auth, gameController.getAll);
router.get('/game/:gid', auth, gameController.getOne);
router.post('/game/new', auth, gameController.new);
router.post('/game/join', auth, gameController.join);

module.exports = router;
