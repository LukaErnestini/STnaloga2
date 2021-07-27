const User = require('../models/user');

const userController = {
  async login(req, res) {
    try {
      const user = await User.findByCredentials(
        req.body.username,
        req.body.password
      );
      const token = await user.generateAuthToken();
      res.cookie('token', token, {
        secure: false, // cause no SSL
        httpOnly: true,
        sameSite: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      res.status(200).json(user);
    } catch (e) {
      res.status(400).send(e);
    }
  },
  async signup(req, res) {
    try {
      const oldUser = await User.findOne({ username: req.body.username });
      if (oldUser)
        return res.status(409).send('User already exists. Please login.');
      const user = new User(req.body);
      // user.save() se klice znotraj generateAuthToken()
      const token = await user.generateAuthToken();
      res.cookie('token', token, {
        secure: false, // cause no SSL
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      res.status(201).json(user);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  async showLogin(req, res) {
    res.render('login', {
      title: 'Login',
    });
  },
  async showSignup(req, res) {
    res.render('signup', {
      title: 'Signup',
    });
  },
  async logout(req, res) {
    try {
      // We remove the token from the user, so that it is no longer valid and save to the db
      req.user.tokens = req.user.tokens.filter(
        (token) => token.token !== req.token
      );
      res.clearCookie('token');
      await req.user.save();
      res.status(200).json('Logged out');
    } catch (e) {
      res.status(500).send();
    }
  },
};

module.exports = userController;
