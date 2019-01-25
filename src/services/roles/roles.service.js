// Initializes the `roles` service on path `/roles`
const createService = require('feathers-mongoose');
const createModel = require('../../models/roles.model');
const hooks = require('./roles.hooks');
const modelToSwagger = require('../../utils/swagger.util');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  const rolesService = createService(options);
  rolesService.docs = modelToSwagger(Model, {
    'actions': ['create', 'read', 'update', 'delete'],
    'subject': 'Post',
    'conditions': {
      'author': '${user.id}'
    }
  });
  app.use('/roles',rolesService);
  
  // Get our initialized service so that we can register hooks
  const service = app.service('roles');

  service.hooks(hooks);
};
