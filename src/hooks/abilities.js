/* eslint-disable quotes */
const { AbilityBuilder, Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden } = require('@feathersjs/errors');
const TYPE_KEY = Symbol.for('type');
const {compiledRolesTemplate} = require('../utils/helpers');
const isEqual = require('lodash.isequal');
Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('delete', 'remove');

function subjectName(subject) {
  if (!subject || typeof subject === 'string') {
    return subject;
  }
  return subject[TYPE_KEY];
}

function defineAbilitiesFor(user, userRoles, publicRoles) {
  const { rules, can } = AbilityBuilder.extract();
  // Hard coding roles
  
  can('create', ['users', 'authManagement']);
  
  // Allow this only for the first user
  // eslint-disable-next-line no-console
  console.warn("!!Important!!- disabled this hard coding role after create your first user, can('manage', 'all')");
  can('manage', 'all');
  // Create your first role 
  // {"name": "manage role", "actions": [ "manage", ], "type": "private", "subject": "roles" }
  // and the add this roleId your your user roles ['roleId'];
  //


  // You can add hard coding roles here:
  // can(['update', 'delete'], 'posts', { author: user._id }, fields: ['-rating])

  // public roles from DB
  if(publicRoles){
    publicRoles.forEach(function({actions, subject, conditions, fields}){
      can(actions, subject, fields, conditions );
    });
  }

  // Roles from DB
  // This is dynamic roles that saved on user document.
  // When user login this data is saved on JWT and available in each query
  if (user && userRoles) {
    const roles = compiledRolesTemplate(userRoles, {user});
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

module.exports = function abilities(name = null) {
  return async function(hook) {
    try {
      const action = hook.method;
      const service = name ? hook.app.service(name) : hook.service;
      const model = service.options && service.options.Model && service.options.Model;
      const serviceName = name || hook.path;
      let roles;
      const rolesResults = await hook.app.service('/roles').find();
      if(rolesResults && rolesResults.data){
        roles = rolesResults.data;
      }else{
        hook.app.error('Missing roles', rolesResults);
      }
      const hasUser = hook.params.user && hook.params.user._id;
      const userId = hasUser && hook.params.user._id;
      const userRolesIds = hasUser ? (hook.params.user.roles || []) : [];
      const userRoles = [];
      const publicRoles = [];
      let blockedRoles = [];
      if(roles){
        roles.forEach(role => {
          if(role.type === 'blocked'){
            if(hasUser && isEqual(role.user, userId)){
              if(role.blockAll){
                hook.app.info(`src/hooks/abilities.js - block ${userId} user by ${role._id} ${role.name} role`);
                throw new Forbidden('You are not allowed, try to log out and and the try again');
              }else{
                blockedRoles = [...blockedRoles, ...role.roles];
              }
            }
          } else if(role.type === 'private'){
            if(hasUser && userRolesIds.some(userRole => ((typeof userRole === 'string' && userRole === role._id) || userRole._id ===  role._id))){
              if(!blockedRoles.length || !blockedRoles.includes(role._id)){
                userRoles.push(role);
              }else{
                hook.app.info(`src/hooks/abilities.js - block ${userId} from role ${role._id}`);
              }
            }
          }else if(role.type === 'public'){
            publicRoles.push(publicRoles);
          }else{
            hook.app.error(`src/hooks/abilities.js ${role._id} includes invalid type, ${role.type}`);
          }
        });
      }
      const ability = defineAbilitiesFor(hook.params.user, userRoles, publicRoles);
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
    } catch (error) {
      hook.app.error('abilities check', error);
      throw new Forbidden(error);
    }
  };
};