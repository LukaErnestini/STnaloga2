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
  const username = socket.handshake.auth.username;
  if (!username) {
    socket.username = 'anon';
    return next();
    // return next(new Error('invalid username'));
  }
  socket.username = username;
  next();
});

// SOCKET.IO
io.on('connection', (socket) => {
  console.log(socket.username + ' connected');
  io.emit('chat message', '> ' + socket.username + ' connected!');

  // list users
  const users = [];
  for (let [id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit('users', users);

  socket.on('chat message', (msg) => {
    io.emit('chat message', socket.username + ': ' + msg);
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
