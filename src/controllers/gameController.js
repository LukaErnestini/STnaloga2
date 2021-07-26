const Game = require('../models/game');

const gameController = {
  async getAll(req, res) {
    try {
      const games = await Game.find({});
      res.status(200).json({ games });
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async getOne(req, res) {
    try {
      const game = await Game.findById(req.params.qid);
      res.status(200).json({ game });
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async new(req, res) {
    try {
      const game = new Game({});
      // TODO
      console.log('this probably does not work');
      // Add authenticated user to the list of players
      game.players.push(req.user);

      await game.save();
    } catch (e) {
      res.status(400).send(e);
    }
  },

  async join(req, res) {
    try {
      const game = new Game({});

      playerLookup = game.players.indexOf(req.user);
      // TODO
      console.log('this probably does not work');
      // Add authenticated user to the list of players if not in already
      if (playerLookup === -1) game.players.push(req.user);

      await game.save();
    } catch (e) {
      res.status(400).send(e);
    }
  },
};

module.exports = gameController;
