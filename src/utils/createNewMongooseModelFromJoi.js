
const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose, null, { _id: false, timestamps: true });
const { accessibleFieldsPlugin } = require('@casl/mongoose');

module.exports  = function (app, name, getJoiValidators) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseSchema = Joigoose.convert(getJoiValidators(true));
  console.log({name: name + 'getJoiValidators'}, getJoiValidators)
  app.set(name + 'getJoiValidators', getJoiValidators); // We need to validate on create and update;

  const schema = new mongooseClient.Schema(mongooseSchema);
 
  schema.plugin(accessibleFieldsPlugin); // @casl/mongoose
  
  return mongooseClient.model(name, schema);
};
