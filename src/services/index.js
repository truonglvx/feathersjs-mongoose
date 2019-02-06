const posts = require('./posts/posts.service.js');
const {services} = require('../../feathers-mongoose-casl');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  // feathers-mongoose-casl services
  app.configure(services.users);
  app.configure(services.authManagement);
  app.configure(services.dashboard);
  app.configure(services.mailer);
  app.configure(services.accountService);
  app.configure(services.uploads);
  app.configure(services.sms);
  app.configure(services.roles);
  app.configure(services.mailer);
  app.configure(services.userAbilities);
  // Specific project services
  app.configure(posts);

};
