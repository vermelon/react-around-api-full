const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');
const UnauthorizedError = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Jacques Cousteau',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Explorer',
  },
  avatar: {
    type: String,
    validate: {
      validator(v) {
        return /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_/0-9\-#.]*)\??([a-z_/0-9\-#=&]*)/gi.test(v);
      },
    },
    default: 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Incorrect email or password');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Incorrect email or password');
          }
          return user;
        });
    });
};

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('user', userSchema);
