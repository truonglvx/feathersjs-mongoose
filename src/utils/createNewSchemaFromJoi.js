
const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose, null, { _id: false, timestamps: true });
const { accessibleFieldsPlugin } = require('@casl/mongoose');

module.exports  = function (app, name, joiValidators) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseSchema = Joigoose.convert(joiValidators.withoutRequired);

  app.set(`validators-${name}`, joiValidators); // We need to validate on create and update;

  const schema = new mongooseClient.Schema(mongooseSchema);
 
  schema.plugin(accessibleFieldsPlugin); // @casl/mongoose
  
  return mongooseClient.model(name, schema);
};