const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 30,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    points: {
      type: Number,
      default: 0,
    },
    gamesCount: {
      type: Number,
      default: 0,
    },
    correctGuessCount: {
      type: Number,
      default: 0,
    },
    winsCount: {
      type: Number,
      default: 0,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Triggers before deleting user
userSchema.pre('remove', async function (next) {
  const user = this;
  next();
});

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error('Crikey! Unable to log in.');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Crikey! Unable to log in.');
  }

  return user;
};

// Instance method
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_TOKEN_KEY,
    {
      expiresIn: '7 days',
    }
  );

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
