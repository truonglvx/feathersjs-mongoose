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
    filters: {$populate (value) {
      const populate = [{path: 'roles', select: ['actions', 'subject', 'conditions', 'fields']}];
      if(value) return populate.push(value);
      return populate;
    }}
  };
  // Initialize our service with any options it requires
  app.use('/users', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);

  // Initialize our service with any options it requires
  app.use('/me', {
    async find(params) {
      const userId = params.user && params.user._id;
      const users = await Model.findById(userId).populate('roles');
      if(users){
        return users;
      }else{
        return notFound;
      }
    },
    // async update(id, data) {
    //   const users = await Model.findOneAndUpdate({_id: id}, data);
    //   console.log(132)
    //   if(users){
    //     return users;
    //   }else{
    //     return notFound;
    //   }
    // },

  });
  const meService = app.service('me');
  meService.hooks(hooks);
};
