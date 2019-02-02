## validators
Each file in validators folder is function that return joi schema
https://github.com/hapijs/joi

We use https://github.com/yolopunk/joi2json to convert the joi schema to mongoose schema

### We want to use the same schema for patch and create then we user required as variable

const getJoiObject = function(withRequired){
  const required = withRequired ? 'required' : 'optional';
  return Joi.object({
    body: Joi.string()[required](),
    rating: Joi.number().max(5),
  });
};

module.exports = getJoiObject;

getJoiObject(true) - will check with required test
getJoiObject(false) - will check without the required test

### Mongoose ref
author: Joi.string().meta({ type: 'ObjectId', ref: 'users', displayKey: 'email' } )

### Array of refs
roles: Joi.array().items(Joi.string().meta({ type: 'ObjectId', ref: 'roles', displayKey: 'name' })),


Why displayKey ? 
displayKey will help us with dashboard service

## Array of string with enums
actions: Joi.array().items(Joi.string().valid('create', 'read','update','delete','manage'))

## Strings with enum
type: Joi.string().valid('private', 'public','blocked')

## Object
const getJoiObject = function(withRequired){
  const required = withRequired ? 'required' : 'optional';
  return Joi.object({
    name: Joi.string().min(5)[required](),
    type: Joi.string().valid('private', 'public','blocked'),
    blocked: Joi.object({
      user:  Joi.string().meta({ type: 'ObjectId', ref: 'users', displayKey: 'email' }),
      roles:  Joi.array().items(Joi.string().meta({ type: 'ObjectId', ref: 'users', displayKey: 'name'})),
      blockAll: Joi.boolean()
    }),
  })
}

## allow null
verifyExpires: Joi.date().allow(null),

## more
name: Joi.string().min(5)[required](),
active: Joi.boolean(),
from: Joi.date(),
