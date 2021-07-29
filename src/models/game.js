const mongoose = require('mongoose');
const User = require('./user.js');

function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

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
    playerPoints: {
      type: Map,
      of: Number,
    },
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
    finished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.pre('save', async function (next) {
  const game = this;

  next();
});

/**
 * @param {String} guess Text to compare to word
 * @param {User} user User that guessed
 *
 * @returns {Boolean} True if guess is correct
 */
gameSchema.methods.checkGuess = async function (guess, user) {
  const game = this;
  //TODO calculate and reward points
  if (guess === game.words[game.turn]) {
    user.correctGuessCount++;
    var elapsedTime =
      (new Date().getTime() - new Date(game.turnStartTime).getTime()) / 1000;
    if (elapsedTime > 300) {
      console.log('Time expired.');
      return false;
    }
    var guessorPoints = 300 - Math.round(elapsedTime / 10) * 10;
    var artistPoints = Math.round(guessorPoints / 2 / 10) * 10; // person drawing gets half the points of the guessor
    console.log(
      'Guessor points: ' + guessorPoints + ', artist: ' + artistPoints
    );
    user.points += guessorPoints;
    var artistUsername = game.players[game.turn].username;

    var oldPoints = game.playerPoints.get(user.username);
    if (!oldPoints) game.playerPoints.set(user.username, guessorPoints);
    else game.playerPoints.set(user.username, oldPoints + guessorPoints);
    // console.log(
    //   'old points: ' +
    //     oldPoints +
    //     ', new: ' +
    //     game.playerPoints.get(user.username)
    // );
    oldPoints = 0;

    oldPoints = game.playerPoints.get(artistUsername);
    if (!oldPoints) game.playerPoints.set(artistUsername, artistPoints);
    else game.playerPoints.set(artistUsername, oldPoints + artistPoints);

    game.turn++;
    const artist = await User.findById(game.players[game.turn - 1]._id);
    artist.points += artistPoints;
    await artist.save();

    if (game.turn === game.players.length) {
      // IF GAME DONE
      game.finished = true;
      return true;
    }
    this.startTimer();
    return true;
  } else return false;
};

gameSchema.methods.start = async function () {
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
    'avto',
    'kombi',
    'ventilator',
    'telefon',
    'milo',
    'kabel',
    'ljubezen',
    'konj',
    'pes',
    'robot',
    'motor',
    'veter',
    'hrib',
  ];
  shuffle(EXAMPLEwords);
  game.words = EXAMPLEwords;

  // TODO REPLACE minimum 2 is for debugging purposes
  if (game.started === true) throw new Error('Game ongoing');
  if (game.players.length >= 2 && game.players.length <= 8) game.started = true;
  else throw new Error('Must be 3-8 players to start the game');

  game.randomizePlayerOrder();
  this.startTimer();
  game.populate('players');
  return game.players[game.playerOrder[game.turn]];
};

gameSchema.methods.startTimer = async function () {
  const game = this;
  game.turnStartTime = new Date().getTime();
  //setTimeout(game.timesUp, 1000 * 60 * 3); // 3 minutes
};

gameSchema.methods.timesUp = async function () {
  const game = this;
  game.turn++;
  this.startTimer();
};

gameSchema.methods.randomizePlayerOrder = async function () {
  const game = this;
  var orderedList = [];
  for (let i = 0; i < game.players.length; i++) {
    orderedList.push(i); // 0,1,2,3...
    // Add game played to each player
    const user = await User.findById(game.players[i]._id);
    user.gamesCount++;
    await user.save();
  }
  shuffle(orderedList);
  game.playerOrder = orderedList;
  return orderedList;
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
