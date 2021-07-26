const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
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
    drawing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    turnCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
