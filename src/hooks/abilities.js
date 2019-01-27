const { AbilityBuilder, Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden } = require('@feathersjs/errors');
const TYPE_KEY = Symbol.for('type');
const {compiledRolesTemplate, unpackRules} = require('../utils/helpers');

Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('delete', 'remove');

function subjectName(subject) {
  if (!subject || typeof subject === 'string') {
    return subject;
  }
  return subject[TYPE_KEY];
}

function defineAbilitiesFor(user) {
  const { rules, can } = AbilityBuilder.extract();

  // Hard coding roles
  can(['create'], 'user');
  // You can add hard coding roles here:
  // can(['update', 'delete'], 'posts', { author: user._id }, fields: ['-rating])
  // can(['update', 'delete'], 'posts', { author: user._id })

  // public roles from DB
  can(['read', 'create'],['roles']);
  can(['update'],['users']);
  can('create',['users', 'authManagement']);
  can('read', ['posts'], ['_id','author']);
  can('create', ['posts']);


  // Roles from DB
  // This is dynamic roles that saved on user document.
  // When user login this data is saved on JWT and available in each query
  if (user && user.roles) {
    const roles = compiledRolesTemplate(unpackRules(user.roles), {user});
    roles.forEach(function({actions, subject, conditions, fields}){
      can(actions, subject, fields, conditions );
    });
    // Hard coding roles
    can(['read'], 'me', { _id: user._id });
  }

  return new Ability(rules, { subjectName });
}

function canReadQuery(query) {
  return query !== null;
}

module.exports = function authorize(name = null) {
  return async function(hook) {
    const action = hook.method;
    const service = name ? hook.app.service(name) : hook.service;
    const model = service.options && service.options.Model && service.options.Model;
    const serviceName = name || hook.path;
    // Fetch public rules
    // const publicRoles = service &&
    if(model){
      hook.app.service('roles').find().then(res => {
        console.log({res})
      })
    }
    //
    const ability = defineAbilitiesFor(hook.params.user);
    const id = hook.id ? hook.id : '';
    const throwUnlessCan = (action, resource) => {
      if (ability.cannot(action, resource)) {
        throw new Forbidden(`You are not allowed to ${action} ${id} ${serviceName}`);
      }
    };

    // We set this to hook before and after each request src/app.hooks.js permittedFields()
    hook.params.ability = ability;
    if(model && model.accessibleFieldsBy){
      hook.params.abilityFields = model.accessibleFieldsBy(ability, action);
    }

    if (hook.method === 'create') {
      hook.data[TYPE_KEY] = serviceName;
      throwUnlessCan('create', hook.data);
    }

    if (!hook.id) {
      const query = toMongoQuery(ability, serviceName, action);

      if (canReadQuery(query)) {
        Object.assign(hook.params.query, query);
      } else {
        throw new Forbidden(`You are not allowed to ${action} ${serviceName}`);
      }

      return hook;
    }

    const params = Object.assign({}, hook.params, { provider: null });
    const result = await service.get(hook.id, params);

    result[TYPE_KEY] = serviceName;
    throwUnlessCan(action, result);

    if (action === 'get') {
      hook.result = result;
    }

    return hook;
  };
};