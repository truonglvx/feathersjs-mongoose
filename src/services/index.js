const posts = require('./posts/posts.service.js');
const uploads = require('./uploads/uploads.service.js');
const files = require('./files/files.service.js');
const mailer = require('./mailer/mailer.service.js');
const sms = require('./sms/sms.service.js');
const roles = require('./roles/roles.service.js');
const {userAbilities, authmanagement, dashboard, users} = require('../../feathers-mongoose-casl');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(posts);
  app.configure(uploads);
  app.configure(files);
  app.configure(mailer);
  app.configure(authmanagement);
  app.configure(sms);
  app.configure(roles);
  app.configure(userAbilities);
  app.configure(dashboard);
};
