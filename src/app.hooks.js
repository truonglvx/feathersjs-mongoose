// Application hooks that run for every service
const log = require('./hooks/log');
const { when } = require('feathers-hooks-common');
const  authorize = require('./hooks/abilities');
const  permittedFields = require('./hooks/permittedFields');
const authenticate = require('./hooks/authenticate');

module.exports = {
  before: {
    all: [
      log(),
      when(
        hook => hook.params.provider &&
        (`/${hook.path}` !== hook.app.get('authentication').path),
        authenticate, 
        authorize(),
        permittedFields()
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
        permittedFields()
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
