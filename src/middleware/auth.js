const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(403).send('A token is required for authentication');
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send('Invalid token.');
  }
};

module.exports = auth;
