// posts-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const postsValidators = require('../validators/posts.validators.js');
const createNewSchemaFromJoi = require('../utils/createNewSchemaFromJoi');

module.exports = function (app) {
  return createNewSchemaFromJoi(app, 'posts', postsValidators);
};
