require('dotenv').config();
require('./db/mongoose');
const express = require('express');
const path = require('path');
const app = express();

//Models

// Routers

// Define paths for express config
const publicDirPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicDirPath));

// view engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates/views'));

// Middleware use
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.listen(3000, () => console.log('Server Up and running'));
