const Game = require('../models/game');
const User = require('../models/user');

const gameController = {
  async getAll(req, res) {
    try {
      const games = await Game.find({}).populate('players');
      // res.status(200).json({ games });
      res.status(200).render('index', { games });
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async getOne(req, res) {
    try {
      const game = await Game.findById(req.params.qid);
      game.populate('players');
      res.status(200).render('game', {
        game,
        owner: game.players[0],
      });
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async new(req, res) {
    try {
      const game = new Game({});
      // Add authenticated user to the list of players
      game.players.push(req.user);
      await game.save();
      res.status(201).json({ game });
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async join(req, res) {
    try {
      const game = await Game.findById(req.body.id);
      playerLookup = game.players.indexOf(req.user._id);
      // Add authenticated user to the list of players if not in already
      if (playerLookup === -1) game.players.push(req.user);
      await game.save();
      res.status(201).json({ game });
    } catch (e) {
      res.status(400).send(e);
    }
  },
};

module.exports = gameController;
