// Application hooks that run for every service
const log = require('./hooks/log.hook.js');
const {hooks} = require('../feathers-mongoose-casl');



module.exports = {
  before: {
    all: [
      log(),
      hooks.validateAbilities
    ],
    find: [],
    get: [],
    create: [hooks.validateSchema],
    update: [hooks.validateSchema],
    patch: [hooks.validateSchema],
    remove: []
  },

  after: {
    all: [ log(),
      hooks.sanitizedData,
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
