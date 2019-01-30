// roles-model.js - A mongoose model
const rolesValidators = require('../validators/roles.validators.js');
const createNewSchemaFromJoi = require('../utils/createNewSchemaFromJoi');

module.exports = function (app) {
  return createNewSchemaFromJoi(app, 'roles', rolesValidators);
};
