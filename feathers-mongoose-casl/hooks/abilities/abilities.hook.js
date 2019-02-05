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
// examples of roles
// {"name": "find me", "actions": ["read"], "type": "public", "subject": ["me"], "condition": { "_id": "{{ user._id }}" } },
// {"name": "allow sing-up", "actions": ["create"], "type": "public", "subject": ["users"] },
// {"name": "allow resetPassword, verifyPassword", "actions": ["create"], "type": "public", "subject": ["authManagement"] },
// {"name": "temporary, for first user", "actions": ["manage"], "subject": ["all"]}


/* eslint-disable quotes */
const { Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden, GeneralError } = require('@feathersjs/errors');
const TYPE_KEY = Symbol.for('type');
const getRolesByTypes = require('./helpers/getRolesByTypes');
const defineAbilities = require('./helpers/defineAbilities');

Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('delete', 'remove');

const abilities = async function(hook, name, method, testMode, userIdForTest ) {
  try {
    const action = method || hook.method; // find,get,update,remove,create
    const service = name ? hook.app.service(name) : hook.service; // posts,roles...
    const model = service.options && service.options.Model && service.options.Model;
    const serviceName = name || hook.path;
    
    /* 
    * Find roles
    *  find roles from cache or from db
    *  ---------------------
    */
    let roles;
    const rolesResults = await hook.app.service('/roles').find({
      query: {
        active: true,
      },
      disabledCache: true
    });
    if(rolesResults && rolesResults.data){
      roles = rolesResults.data;
    }else{
      hook.app.error('Missing roles from DB', rolesResults);
    }

    /* Default roles
    *  Get default roles from config
    *  ---------------------
    */
    const mongooseCaslConfig = hook.app.get('feathers-mongoose-casl') || {};
    if(!mongooseCaslConfig){
      hook.app.error('Missing feathers-mongoose-casl in config file');
    }
    const defaultRoles = mongooseCaslConfig.defaultRoles || [];

    /* Find user
    *  find user from cache or from db
    *  ---------------------
    */
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

    /* filter and group the roles by type
    *  filters un valid roles (active:false, or from/to date fail)
    *  ---------------------
    */
    const [userRoles, publicRoles] = getRolesByTypes(hook, hasUser, userRolesIds, roles, userId, testMode);

    /* defineAbilities
    *  compiledRolesTemplate with user data and define Abilities
    *  ---------------------
    */
    const ability = defineAbilities(user, userRoles, publicRoles, defaultRoles);
    const id = hook.id ? hook.id : '';
    
    /* Create Test ability function
    *  ---------------------
    */
    const throwUnlessCan = (action, resource) => {
      if (ability.cannot(action, resource)) {
        throw new Forbidden(`You are not allowed to ${action} ${id} ${serviceName}`);
      }
    };

    /* accessibleFieldsBy
    *  We set accessibleFieldsBy from model and use it inside feathers-mongoose-casl/hooks/sanitizedData.hook.js 
    *  ---------------------
    */
    hook.params.ability = ability;
    if(model && model.accessibleFieldsBy){
      hook.params.abilityFields = model.accessibleFieldsBy(ability, action);
    }

    /* Test mode
    *  test mode is owr way to run abilities service without blocking the process
    *  this help us to serve user-abilities service, service that return info about the user abilities
    *  ---------------------
    */
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


    /* Check CREATE abilities
    *  ---------------------
    */

    if (hook.method === 'create') {
      hook.data[TYPE_KEY] = serviceName;
      throwUnlessCan('create', hook.data);
    }

    /* Build query
    *  build query with filters before get&find
    *  ---------------------
    */
    if (!hook.id) {
      const query = toMongoQuery(ability, serviceName, action);

      if (query !== null) {
        Object.assign(hook.params.query, query);
      } else {
        throw new Forbidden(`You are not allowed to ${action} ${serviceName}`);
      }

      return hook;
    }

    /* Check GET abilities
    *  ---------------------
    */
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