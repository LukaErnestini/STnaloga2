const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const gameController = require('../controllers/gameController');

router.get('/games', auth, gameController.getAll);
router.post('/games', auth, gameController.getAllJSON);
router.get('/game/:gid', auth, gameController.getOne);
router.post('/game/new', auth, gameController.new);
router.post('/game/join', auth, gameController.join);
router.put('/game/:gid/leave', auth, gameController.leave);

module.exports = router;
