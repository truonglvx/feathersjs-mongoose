/* eslint-disable quotes */
// Initializes the `roles` service on path `/user-abilities`
const createService = require('./user-abilities.class.js');
const hooks = require('./user-abilities.hooks');

module.exports = function (app) {
    
  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  app.use('/user-abilities',createService(options));
  const service = app.service('user-abilities');
  
  service.hooks(hooks);

};
