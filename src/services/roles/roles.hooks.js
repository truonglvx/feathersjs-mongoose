

const commonHooks = require('feathers-hooks-common');
const rolesCache = require('../../hooks/rolesCache.hook.js');

module.exports = {
  before: {
    all: [],
    find: [
      commonHooks.when(
        commonHooks.isProvider('server'), // We want to serve catch roles only for ability service;
        rolesCache()
      )],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [rolesCache()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
