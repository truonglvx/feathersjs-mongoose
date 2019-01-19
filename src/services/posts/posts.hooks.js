const validate = require('../../utils/joi.util');
const postsValidator = require('../../validators/posts.validator');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validate.form(postsValidator.withRequired, validate.options) ],
    update: [ validate.form(postsValidator.withoutRequired,  validate.options) ],
    patch: [ validate.form(postsValidator.withoutRequired,  validate.options) ],
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
