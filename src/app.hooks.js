// Application hooks that run for every service
const log = require('./hooks/log');
const { when } = require('feathers-hooks-common');
const  authorize = require('./hooks/abilities');
const  sanitizedData = require('./hooks/sanitizedData');
const authenticate = require('./hooks/authenticate');

module.exports = {
  before: {
    all: [
      log(),
      when(
        hook => hook.params.provider &&
        (`/${hook.path}` !== hook.app.get('authentication').path),
        authenticate, 
        authorize(), // Checks whether the client has permission
        sanitizedData() // Remove data before Create/Update
      ),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ log(),
      when(
        hook => hook.params.provider,
        sanitizedData() // Remove data after reading before sending to client
      ),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
