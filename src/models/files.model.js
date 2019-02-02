// files-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const filesValidators = require('../validators/files.validators.js');
const createModelFromJoi = require('../utils/createModelFromJoi');

module.exports = function (app) {
  return createModelFromJoi(app, 'files', filesValidators);
};
