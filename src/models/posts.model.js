// posts-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const postsValidators = require('../validators/posts.validators.js');
const {createModelFromJoi} = require('../../feathers-mongoose-casl');

module.exports = function (app) {
  return createModelFromJoi(app, 'posts', postsValidators);
};
