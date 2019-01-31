// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const usersValidators = require('../validators/users.validators.js');
const createNewMongooseModelFromJoi = require('../utils/createNewMongooseModelFromJoi');

module.exports = function (app) {
  return createNewMongooseModelFromJoi(app, 'users', usersValidators);
};
