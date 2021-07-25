const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

// LOGIN submit
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();

    // req.session.localVar = { user, token, username: user.username };
    // res.redirect('/');
    res.status(200).json({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//SIGNUP submit
router.post('/signup', async (req, res) => {
  try {
    const oldUser = await User.findOne({ username: req.body.username });
    if (oldUser)
      return res.status(409).send('User already exists. Please login.');

    const user = new User(req.body);
    // user.save() se klice znotraj generateAuthToken()
    const token = await user.generateAuthToken();

    // req.session.localVar = { user, token, username: user.username };
    // res.status(201).redirect('/');
    res.status(201).json(user);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

module.exports = router;
