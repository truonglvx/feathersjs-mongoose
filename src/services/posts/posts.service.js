// Initializes the `posts` service on path `/posts`
const createService = require('feathers-mongoose');
const createModel = require('../../models/posts.model');
const hooks = require('./posts.hooks');
const modelToSwagger = require('../../utils/swagger.util');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  const postsService = createService(options);
  postsService.docs = modelToSwagger(Model);

  // Initialize our service with any options it requires
  app.use('/posts', postsService);

  // Get our initialized service so that we can register hooks
  const service = app.service('posts');
  service.hooks(hooks);
};
