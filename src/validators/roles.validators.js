const Joi = require('joi');

const getJoiObject = function(withRequired){
  const required = withRequired ? 'required' : 'optional';
  return {
    // author: Joi.string().meta({ type: 'ObjectId', ref: 'users' }),
    name: Joi.string()[required](),
    description: Joi.string(),
    type: Joi.string().valid('private', 'public','blocked'),
    blocked: Joi.object({
      user:  Joi.string().meta({ type: 'ObjectId', ref: 'users' }),
      roles:  Joi.array().items(Joi.string().meta({ type: 'ObjectId', ref: 'users' })),
      blockAll: Joi.boolean()
    }),
    actions: Joi.array().items(Joi.string().valid('create', 'read','update','delete','manage'))[required](),
    subject: Joi.array().items(Joi.string()),
    fields: Joi.array(),
    conditions: Joi.object(),
    active: Joi.boolean(),
  };
};

module.exports = {
  withRequired: Joi.object(getJoiObject(true)),
  withoutRequired: Joi.object(getJoiObject(false))
};