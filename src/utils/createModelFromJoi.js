
const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose, null, { _id: false, timestamps: true });
const { accessibleFieldsPlugin } = require('@casl/mongoose');

/**
 * @function createModelFromJoi
 * This function receive getJoi() function that return joi schema and return mongoose model;
 * and also set the getJoi reference to app for future validators check and dashboard service
 */
module.exports  = function (app, name, getJoi) {

  const mongooseClient = app.get('mongooseClient');

  const joiSchema = getJoi(true);

  const mongooseSchema = Joigoose.convert(joiSchema);

  app.set(name + 'getJoi', getJoi); // Set getJoi reference to help us validate user requests

  const schema = new mongooseClient.Schema(mongooseSchema);
 
  schema.plugin(accessibleFieldsPlugin); // @casl/mongoose - field permissions - this will help us sanitized data
  
  return mongooseClient.model(name, schema);
};


// Example of use
//----------------------------
// src/models/posts.model.js


// const postsValidators = require('../validators/posts.validators.js');
// const createModelFromJoi = require('../utils/createModelFromJoi');

// module.exports = function (app) {
//   return createModelFromJoi(app, 'posts', postsValidators);
// };
