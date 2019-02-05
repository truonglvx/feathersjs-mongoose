// Application hooks that run for every service
const log = require('./hooks/log.hook.js');
const { when } = require('feathers-hooks-common');
const {sanitizedData, authenticate, validateSchema, abilities} = require('../feathers-mongoose-casl');


const skipServices = ['dashboard','user-abilities'];
module.exports = {
  before: {
    all: [
      log(),
      when(
        hook => hook.params.provider &&
        (`/${hook.path}` !== hook.app.get('authentication').path),
        authenticate, 
        abilities.hook, // Checks whether the client has permission
        sanitizedData(skipServices) // Remove fields that block by roles from data before Create/Update
      ),
    ],
    find: [],
    get: [],
    create: [validateSchema()],
    update: [validateSchema()],
    patch: [validateSchema()],
    remove: []
  },

  after: {
    all: [ log(),
      when(
        hook => hook.params.provider,
        sanitizedData(skipServices) // Remove fields that blocked by the roles from data before sending to client
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
