const { authenticate } = require('@feathersjs/authentication').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../authmanagement/notifier');
const commonHooks = require('feathers-hooks-common');
const usersCache = require('../../hooks/usersCache');
const removeUserProtectedFields = require('../../hooks/removeUserProtectedFields');

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [commonHooks.when(
      commonHooks.isProvider('external'),
      removeUserProtectedFields(),
    )],
    find: [],
    get: [
      commonHooks.when(
        commonHooks.isProvider('server'), // We want to serve user from catch only for authentication
        usersCache()
      )],
    create: [ 
      hashPassword(),
      verifyHooks.addVerification(),
    ],
    update: [],
    patch: [
      hashPassword(),
      authenticate('jwt')
    ],
    remove: []
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      usersCache(), // after user is changed we want to clear catch;
      protect('password'),
      commonHooks.when(
        commonHooks.isProvider('external'),
        removeUserProtectedFields(),
      ),
    ],
    find: [],
    get: [],
    create: [
      context => {
        accountService(context.app).notifier('resendVerifySignup', context.result);
      },
      verifyHooks.removeVerification()
    ],
    update: [],
    patch: [],
    remove: []
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