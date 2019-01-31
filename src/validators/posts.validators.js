const Joi = require('joi');

const getJoiObject = function(withRequired){
  const required = withRequired ? 'required' : 'optional';
  return Joi.object({
    author: Joi.string().meta({ type: 'ObjectId', ref: 'users', displayKey: 'email', } ),
    title: Joi.string()[required](),
    body: Joi.string()[required](),
    rating: Joi.number().max(5),
  });
};

module.exports = getJoiObject;

// const joi2json = require('../utils/joi2json');

// console.log(joi2json(Joi.object(getJoiObject(true))))