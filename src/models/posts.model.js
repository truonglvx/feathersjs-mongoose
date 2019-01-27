// posts-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose, null, { _id: false, timestamps: true });
const postsValidator= require('../validators/posts.validator.js');
const { accessibleFieldsPlugin } = require('@casl/mongoose')

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const posts = new Schema(Joigoose.convert(postsValidator.withoutRequired));
  posts.plugin(accessibleFieldsPlugin)
  return mongooseClient.model('posts', posts);
};
