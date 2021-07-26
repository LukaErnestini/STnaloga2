const express = require('express');
const Game = require('../models/game');
const auth = require('../middleware/auth');
const router = new express.Router();

router.get('/games', auth, async (req, res) => {
  try {
    const games = await Game.find({});
    res.status(200).json({ games });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/game/:gid', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.qid);
    res.status(200).json({ game });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/game/new', auth, async (req, res) => {
  try {
    // TODO randomly select from list of words
    var words = [
      'banana',
      'tipkovnica',
      'monitor',
      'nosorog',
      'svetloba',
      'cepivo',
      'podstavek',
      'sladoled',
    ];
    const game = new Game({
      words,
    });

    // Add authenticated user to the list of players
    game.players.append(req.user);

    await game.save();
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
