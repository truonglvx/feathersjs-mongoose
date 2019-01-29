// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose, null, { _id: false, timestamps: true });
const usersValidator = require('../validators/users.validator.js');

module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema(Joigoose.convert(usersValidator.withoutRequired));

  return mongooseClient.model('users', users);
};
