

// rolesCache.hook.js
// This hook will check if roles collection is saved in cache
// if the roles will be found in the cache then response will be from cache
// if not then we will be set in the cache at hook.after.find the roles collection 
// in each changed in roles collection we clear the cache

const feathersCache = require('@feathers-plus/cache');

let rolesCacheMap;

module.exports = function handleRolesCache() {
  return async function(hook) {
    try {
      const rolesCacheConfig = hook.app.get('roles-cache');
      if(!rolesCacheConfig.enabled) return hook;

      if(!rolesCacheMap){
        hook.app.info('init roles cache');
        rolesCacheMap = feathersCache(rolesCacheConfig['local-config']);
      }
    
      const hookType = hook.type;
      const method = hook.method;
    
      if(hookType === 'before' && method === 'find'){
        if(hook.params.disabledCache) {
          hook.app.info('skip roles from cache, return from DB');
          return hook;
        }
        const rolesFromCatch = rolesCacheMap.get('find-roles');
        if(rolesFromCatch){
          hook.app.info('return roles from cache');
          hook.result = rolesFromCatch; // Skip the DB request
        }
        return hook;
      }

    
      if(hookType === 'after' && method === 'find'){
        if(!hook.result.fromCache){
          // save roles is cache
          hook.result.fromCache = true;
          rolesCacheMap.set('find-roles', hook.result);
          hook.app.info('Save roles in cache');
          return hook;
        }
      }

      if(hookType === 'after' && ['patch','update', 'remove'].includes(method)){
        rolesCacheMap.reset();
        hook.app.info('Removed roles from cache after ', method);
        return hook;
      }
      return hook;
    } catch (error) {
      hook.app.error('rolesCache ', error);
    }
  };
};

// rolesCacheMap: {
//   "enabled": true,
//  "local-catch": true,
//  "local-config": {
//    "maxAge": 3600000,
//    "max": 100
//  }
// }