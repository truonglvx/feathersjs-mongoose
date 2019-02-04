// abilities.hook.js
// https://blog.feathersjs.com/authorization-with-casl-in-feathersjs-app-fd6e24eefbff
// abilities is run before each request, apply inside src/app.hooks.js
// run after authenticate that validate user from headers
// when user or anonymous user make request me make sure he have the right roles
// roles can be hard coded in this file or came from server
// 3 types of roles-
//   1- public - rules that apply to everyone
//   2- private - rules that apply for only user with pointer to this roles
//   3- blocked - this roles are included user id and can block user roles or block the user.

/* eslint-disable quotes */
const { AbilityBuilder, Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden, GeneralError } = require('@feathersjs/errors');
const TYPE_KEY = Symbol.for('type');
const isEqual = require('lodash.isequal');
const {compiledRolesTemplate} = require('../utils/helpers');

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
  
  // Public Hard coding roles start
  can('create', ['users', 'authManagement']);
  // Public Hard coding roles end

  // Allow this only for the first user
  // eslint-disable-next-line no-console
  console.warn("!!Important!!- disabled this hard coding role after create your first user, can('manage', 'all')");
  can('manage', ['dashboard', 'user-abilities']);
  can('read', 'posts');
  can('create', 'posts', ['title', 'body']);
  can('update', 'posts', ['body']);
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

function getRolesByTypes (hook, hasUser, userRolesIds, roles, userId, testMode) {
  const userRoles = [];
  const publicRoles = [];
  let blockedRoles = [];
  if(roles){
    roles.forEach(role => {
      if(role.type === 'blocked'){
        if(hasUser && isEqual(role.user, userId)){
          if(role.blockAll){
            hook.app.info(`src/hooks/abilities.js - block ${userId} user by ${role._id} ${role.name} role`);
            if(testMode) {
              hook.params.abilityTestCheckResult = false;
              hook.params.abilityTestCheckRun = true;
              return hook;
            }
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
      }
    });
  }
  return [userRoles, publicRoles, blockedRoles];
}

const abilities = async function(hook, name, method, testMode, userIdForTest ) {
  try {
    const action = method || hook.method; // find
    const service = name ? hook.app.service(name) : hook.service; // posts
    const model = service.options && service.options.Model && service.options.Model;
    const serviceName = name || hook.path;
    let roles;
    const rolesResults = await hook.app.service('/roles').find({
      query: {
        active: true
      }
    });
    if(rolesResults && rolesResults.data){
      roles = rolesResults.data;
    }else{
      hook.app.error('Missing roles', rolesResults);
    }
    let user = hook.params.user;
    if(testMode && userIdForTest){
      user = await hook.app.service('/users').get(userIdForTest);
      if(!user){
        throw new GeneralError(`User Not Found`);
      }
    }
    const hasUser = user && user._id;
    const userId = hasUser && user._id;
    const userRolesIds = hasUser ? (user.roles || []) : [];
    const [userRoles, publicRoles] = getRolesByTypes(hook, hasUser, userRolesIds, roles, userId, testMode);

    const ability = defineAbilitiesFor(user, userRoles, publicRoles);
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
    if(testMode) {
      if(!hook.data) hook.data = {};
      hook.data[TYPE_KEY] = serviceName;
      try {
        throwUnlessCan(method, hook.data);
        hook.params.abilityTestCheckResult = true;
        hook.params.abilityTestCheckRun = true;
      } catch (error) {
        hook.params.abilityTestCheckResult = false;
        hook.params.abilityTestCheckRun = true;
      }
      return hook;
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

module.exports = {
  hook: abilities,
  test: (hook, name, method, userId) => abilities(hook, name, method, true, userId) // Test return results and not throw expecting that block the process
};