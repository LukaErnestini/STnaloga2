require('dotenv').config();
require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const hbs = require('hbs');
const auth = require('./middleware/auth');

const app = express();

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
app.use(userRouter);

app.post('/welcome', auth, (req, res) => {
  res.status(200).send('Welcome 🙌 ');
});

app.get('/', (req, res) => {
  try {
    if (!req.cookies.token) res.redirect('/login');
    res.send('landing page lol');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(process.env.PORT, () => console.log('Server up and running'));
