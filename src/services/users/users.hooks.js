const { authenticate } = require('@feathersjs/authentication').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../authmanagement/notifier');
const commonHooks = require('feathers-hooks-common');
const usersCache = require('../../hooks/usersCache');

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

const protectedFields = ['-email',
  '-isVerified',
  '-verifyToken',
  '-verifyShortToken',
  '-verifyExpires',
  '-verifyChanges',
  '-resetToken',
  '-resetShortToken',
  '-resetExpires'];
const pick = require('../../utils/pick');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      commonHooks.when(
        commonHooks.isProvider('server'), // We want to serve catch user only for authentication
        usersCache()
      )],
    create: [ 
      hashPassword(),
      verifyHooks.addVerification(),
    ],
    update: [function(hook){
      hook.data = pick(hook.data, protectedFields);
      return hook;
    }],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(true, 
          ...['email',
            'isVerified',
            'verifyToken',
            'verifyShortToken',
            'verifyExpires',
            'verifyChanges',
            'resetToken',
            'resetShortToken',
            'resetExpires']
        ),
        hashPassword(),
        authenticate('jwt')
      )
    ],
    remove: []
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      usersCache(), // after user is changed we want to clear catch;
      protect('password'),
    ],
    find: [],
    get: [],
    create: [
      context => {
        accountService(context.app).notifier('resendVerifySignup', context.result);
      },
      verifyHooks.removeVerification()
    ],
    update: [function(hook){
      hook.result = pick(hook.result, protectedFields);
      return hook;
    }, ],
    patch: [function(hook){
      hook.result = pick(hook.result, protectedFields);
      return hook;
    }, ],
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