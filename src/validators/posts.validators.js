const Joi = require('joi');

const getJoiObject = function(withRequired){
  const required = withRequired ? 'required' : 'optional';
  return {
    author: Joi.string().meta({ type: 'ObjectId', ref: 'users' } ),
    title: Joi.string()[required](),
    body: Joi.string()[required](),
    rating: Joi.number().min(4).required(),
  };
};

module.exports = {
  withRequired: Joi.object(getJoiObject(true)),
  withoutRequired: Joi.object(getJoiObject(false))
};