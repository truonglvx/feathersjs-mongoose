// posts-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const postsValidators = require('../validators/posts.validators.js');
const createNewMongooseModelFromJoi = require('../utils/createNewMongooseModelFromJoi');

module.exports = function (app) {
  return createNewMongooseModelFromJoi(app, 'posts', postsValidators);
};
