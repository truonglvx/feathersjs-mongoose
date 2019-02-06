const sanitizedData = require('./hooks/sanitizedData.hook');
const rolesCache = require('./hooks/cache/rolesCache.hook');
const usersCache = require('./hooks/cache/usersCache.hook');
const authenticate = require('./hooks/authenticate/authenticate.hook');
const abilities = require('./hooks/abilities/abilities.hook');
const removeUserProtectedFields = require('./hooks/abilities/removeUserProtectedFields.hook');
const returnUserOnLogin = require('./hooks/abilities/returnUserOnLogin.hook');
const validateSchema = require('./hooks/abilities/validateSchema.hook');

const createModelFromJoi = require('./utils/createModelFromJoi');
const {
  deletePropertyPath,
  compiledRolesTemplate,
  swaggerAuthenticationCookie,
  asyncForEach
} = require('./utils/helpers');
const joi2json = require('./utils/joi2json');
const pick = require('./utils/pick');
const modelToSwagger = require('./utils/modelToSwagger.util');
const userAbilities = require('./services/user-abilities/user-abilities.service');
const authmanagement = require('./services/authmanagement/authmanagement.service');
const accountService = require('./services/authmanagement/notifier');
const dashboard = require('./services/dashboard/dashboard.service');
const users = require('./services/users/users.service');

module.exports = {
  createModelFromJoi,
  deletePropertyPath,
  compiledRolesTemplate,
  swaggerAuthenticationCookie,
  asyncForEach,
  joi2json,
  pick,
  modelToSwagger,
  sanitizedData,
  rolesCache,
  usersCache,
  authenticate,
  abilities,
  removeUserProtectedFields,
  returnUserOnLogin,
  validateSchema,
  userAbilities,
  authmanagement,
  accountService,
  dashboard,
  users
};