// Initializes the `users` service on path `/users`
const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const errors = require('@feathersjs/errors');

const notFound = new errors.NotFound('User does not exist');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
  };
  
  // Initialize our service with any options it requires
  app.use('/users', createService(options));
  // Get our initialized service so that we can register hooks
  const service = app.service('users');
  // Swagger docs
  if(app.docs && app.docs.paths['/users']){
    app.docs.paths['/users'].post.description = 'Create user';
    app.docs.paths['/users'].post.parameters[0].schema = {
      type: 'object',
      example: {
        email: 'userEmail@gmail.com',
        password: 'password'
      }};
  }
  service.hooks(hooks);

  // Return user document to authenticate user
  app.use('/me', {
    async find(params) {
      const userId = params.user && params.user._id;
      const users = await Model.findById(userId);
      if(users){
        return users;
      }else{
        return notFound;
      }
    },
  });
  const meService = app.service('me');
  meService.hooks(hooks);

};
