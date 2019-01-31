// roles-model.js - A mongoose model
const rolesValidators = require('../validators/roles.validators.js');
const createNewMongooseModelFromJoi = require('../utils/createNewMongooseModelFromJoi');

module.exports = function (app) {
  return createNewMongooseModelFromJoi(app, 'roles', rolesValidators);
};
