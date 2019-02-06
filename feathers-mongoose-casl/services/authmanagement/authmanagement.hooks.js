
const { authenticate } = require('@feathersjs/authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const isAction = () => {
  const args = Array.from(arguments);
  return hook => args.includes(hook.data.action);
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      commonHooks.iff(
        isAction('passwordChange', 'identityChange'),
        [
          authenticate('jwt'),
        ],
      ),
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
