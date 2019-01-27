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
    'description': 'user can update post except the rating field',
    'actions': ['update','create'],
    'subject': 'posts',
    'fields' : ['-rating'],
    'conditions': {
      'author': '{{ user._id }}'
    }
  });
  app.use('/roles',rolesService);
  
  // Get our initialized service so that we can register hooks
  const service = app.service('roles');

  service.hooks(hooks);
};

// roles examples
// 'example1':{
//   'description': 'anybody can read the posts title',
//   'actions': ['read'],
//   'subject': 'posts',
//   'fields': ['title'],
// },
// 'example2':{
//   'description': 'only author can delete or update the post',
//   'actions': ['delete', 'update'],
//   'subject': 'posts',
//   'conditions': {
//     'author': '{{ user._id }}'
//   }
// },
// 'example3':{
//   'description': 'anybody can read the posts title, only author can see the post body',
//   'actions': ['read'],
//   'subject': 'posts',
//   'fields' : ['_id', 'title', {'body': '{{ user._id }}'}]
// },
// 'example4':{
//   'description': 'user can update post except the rating field',
//   'actions': ['update','create'],
//   'subject': 'posts',
//   'fields' : ['-rating'],
//   'conditions': {
//     'author': '{{ user._id }}'
//   }
// },
// 'example5':{
//   'description': 'anybody can see post except the _id field',
//   'actions': ['read'],
//   'subject': 'posts',
//   'fields' : ['-_id']
// },