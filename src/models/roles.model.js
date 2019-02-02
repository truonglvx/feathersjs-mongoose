// roles-model.js - A mongoose model
const rolesValidators = require('../validators/roles.validators.js');
const createModelFromJoi = require('../utils/createModelFromJoi');

module.exports = function (app) {
  return createModelFromJoi(app, 'roles', rolesValidators);
};
