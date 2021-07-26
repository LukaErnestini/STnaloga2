const mongoose = require('mongoose');
const User = require('./user.js');

const gameSchema = new mongoose.Schema(
  {
    // First in list is owner
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    ],
    started: {
      type: Boolean,
      default: false,
    },
    words: [
      {
        type: String,
      },
    ],
    playerOrder: [
      {
        type: Number,
      },
    ],
    // turn counter
    turn: {
      type: Number,
      default: 0,
    },
    turnStartTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

gameSchema.pre('save', async function (next) {
  const game = this;
  // TODO randomly select from list of words
  var EXAMPLEwords = [
    'banana',
    'tipkovnica',
    'monitor',
    'nosorog',
    'svetloba',
    'cepivo',
    'podstavek',
    'sladoled',
  ];
  game.words = EXAMPLEwords;

  // Game ended condition
  if (!game.started) {
    if (game.turn === game.players.length) {
      //TODO
    } else if (game.players.length === 8) {
      game.start();
    }
  }

  next();
});

/**
 * @param {String} guess Text to compare to word
 * @param {User} user User that guessed
 *
 * @returns {User} Next user's turn
 */
gameSchema.methods.checkGuess = async function (guess, user) {
  const game = this;
  //TODO calculate and reward points
  if (guess === game.words[game.turn]) {
    game.turn++;
    user.correctGuessCount++;
    game.startTimer();
    return game.players[game.playerOrder[game.turn]];
  }
};

gameSchema.methods.start = async function () {
  const game = this;
  // TODO REPLACE minimum 2 is for debugging purposes
  if (game.players.length >= 2 && game.players.length <= 8) game.started = true;
  else throw new Error('Must be 3-8 players to start the game');
  game.randomizePlayerOrder();
  game.startTimer();

  return game.players[game.playerOrder[game.turn]];
};

gameSchema.methods.startTimer = async function () {
  const game = this;
  game.turnStartTime = new Date().getTime();
  setTimeout(game.timesUp, 1000 * 60 * 3); // 3 minutes
};

gameSchema.methods.timesUp = async function () {
  const game = this;
  game.turn++;
  game.startTimer();
};

gameSchema.methods.randomizePlayerOrder = async function () {
  const game = this;
  var orderedList = [];
  var randomList = [];
  for (let i = 0; i < game.players.length; i++) orderedList.push(i); // 0,1,2,3...
  for (let i = 0; i < game.players.length; i++)
    randomList.push(orderedList.splice(getRandomInt(0, orderedList.length), 1)); // mixed
  game.playerOrder = randomList;
  return randomList;
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
