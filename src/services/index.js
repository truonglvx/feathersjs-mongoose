const users = require('./users/users.service.js');
const posts = require('./posts/posts.service.js');
const uploads = require('./uploads/uploads.service.js');
const files = require('./files/files.service.js');
const mailer = require('./mailer/mailer.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(posts);
  app.configure(uploads);
  app.configure(files);
  app.configure(mailer);
};
