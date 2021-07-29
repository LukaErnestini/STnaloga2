require('dotenv').config();
require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const hbs = require('hbs');
const auth = require('./middleware/auth');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
  },
});
const Game = require('./models/game');
const User = require('./models/user');

const publicDirPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

// Setup static directory to serve
app.use(express.static(publicDirPath));

// view engine configuration
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Middleware use
// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cookieParser());

// Routers
const userRouter = require('./routers/user');
const gameRouter = require('./routers/game');
app.use(userRouter);
app.use(gameRouter);

app.post('/welcome', auth, (req, res) => {
  res.status(200).send('Welcome 🙌 ');
});

// SOCKET.IO MIDDLEWARE
io.use((socket, next) => {
  const username = socket.handshake.auth.x;
  if (!username) {
    // socket.username = 'anon';
    // return next();
    return next(new Error('invalid username'));
    // TODO fix
  }
  socket.username = username;
  socket.gid = socket.handshake.auth.gid;
  socket.join(socket.gid);
  next();
});

// SOCKET.IO
io.on('connection', async (socket) => {
  io.to(socket.gid).emit('chat message', '> ' + socket.username + ' connected');

  // receive game id
  var room = '';
  var game = {};
  socket.on('gameid', async (data) => {
    game = await Game.findById(data.gameid).populate('players');
    socket.join(game._id);
    room = game._id;
    socket.room = game._id;
    io.to(socket.gid).emit('gameplayers', {
      users: game.players,
      started: game.started,
    }); // send game.players
  });

  game = await Game.findById(socket.gid).populate('players');
  if (game.started) {
    if (game.turn >= game.players.length) {
      // IF GAME DONE
      var winner = [...game.playerPoints.entries()].reduce((a, e) =>
        e[1] > a[1] ? e : a
      );
      io.to(socket.gid).emit('finished', {
        winner,
      });
      return;
    }

    var elapsedTime =
      (new Date().getTime() - new Date(game.turnStartTime).getTime()) / 1000;

    io.to(socket.gid).emit('start', {
      elapsedTime,
      move: game.players[game.turn].username,
      round: game.turn + 1,
      totalRounds: game.players.length,
      word: game.words[game.turn],
    });
  }

  socket.on('disconnect', (reason) => {
    io.to(socket.gid).emit('chat message', '> ' + socket.username + ' left');
    io.to(socket.gid).emit('gameplayers', {
      users: game.players,
      started: game.started,
    }); // send game.players
  });

  // START GAME
  socket.on('start', async (data) => {
    game = await Game.findById(socket.gid).populate('players');
    game.start();
    // TODO fix room
    //io.to(room).emit('start', {

    io.to(socket.gid).emit('start', {
      move: game.players[game.turn].username,
      round: game.turn + 1,
      totalRounds: game.players.length,
      word: game.words[game.turn],
    });
    await game.save();
  });

  socket.on('draw', (data) => {
    socket.broadcast.to(socket.gid).emit('draw', data.positions);
  });

  socket.on('clear', () => {
    socket.broadcast.to(socket.gid).emit('clear');
  });

  // GUESS
  socket.on('chat message', async (msg) => {
    io.to(socket.gid).emit('chat message', socket.username + ': ' + msg);
    game = await Game.findById(socket.gid).populate('players');
    const user = await User.findOne({ username: socket.username });
    if (game.players[game.turn].username === user.username) return;
    var oldTurn = game.turn;
    game.checkGuess(msg, user);
    if (game.turn !== oldTurn) {
      io.to(socket.gid).emit(
        'chat message',
        '> Correct word was: ' + game.words[game.turn - 1]
      );
      socket.emit('goodGuess');
    }

    // if (game.finished) {
    if (game.turn >= game.players.length) {
      // IF GAME DONE
      var winner = [...game.playerPoints.entries()].reduce((a, e) =>
        e[1] > a[1] ? e : a
      );
      console.log(winner);
      socket.emit('win'); // placeholder, doesnt play on the winner, but on the socket that last guessed
      const winnerUser = await User.findOne({ username: winner[0] });
      winnerUser.winsCount++;
      await winnerUser.save();
      io.to(socket.gid).emit('finished', {
        winner,
      });
      await game.save();
      return;
    }

    io.to(socket.gid).emit('start', {
      move: game.players[game.turn].username,
      round: game.turn + 1,
      totalRounds: game.players.length,
      word: game.words[game.turn],
    });
    await user.save();
    await game.save();
  });

  socket.on('timesup', async () => {
    game = await Game.findById(socket.gid).populate('players');
    const user = await User.findOne({ username: socket.username });
    if (game.players[game.turn].username === user.username) {
      // tako, da samo enkrat izvedemo to funkcijo
      console.log('Times up, calling function. Turn: ' + game.turn);
      io.to(socket.gid).emit(
        'chat message',
        '> Correct word was: ' + game.words[game.turn]
      );
      game.timesUp();
      console.log('After function. Turn: ' + game.turn);

      //if (game.finished) {
      if (game.turn >= game.players.length) {
        var winner = [...game.playerPoints.entries()].reduce((a, e) =>
          e[1] > a[1] ? e : a
        );
        const winnerUser = await User.findOne({ username: winner[0] });
        winnerUser.winsCount++;
        await winnerUser.save();
        socket.emit('win'); // placeholder, doesnt play on the winner, but on the socket that last guessed
        io.to(socket.gid).emit('finished', {
          winner,
        });
        return;
      }

      io.to(socket.gid).emit('start', {
        move: game.players[game.turn].username,
        round: game.turn + 1,
        totalRounds: game.players.length,
        word: game.words[game.turn],
      });
      await game.save();
      await user.save();
    }
  });
});

app.get('/', (req, res) => {
  try {
    if (!req.cookies.token) res.redirect('/login');
    res.redirect('/games');
  } catch (error) {
    res.status(500).send(error);
  }
});

http.listen(process.env.PORT, () => console.log('Server up and running'));
