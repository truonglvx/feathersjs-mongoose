// Initializes the `dashboard` service on path `/dashboard`
const createService = require('./dashboard.class.js');
const hooks = require('./dashboard.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  // Initialize our service with any options it requires
  app.use('/dashboard', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('dashboard');

  service.hooks(hooks);
};
