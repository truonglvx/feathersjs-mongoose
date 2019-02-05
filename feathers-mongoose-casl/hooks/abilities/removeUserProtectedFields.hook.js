/**
 * removeUserProtectedFields.hook.js
 * Before update/create/patch
 * this hook will remove this fields
 *  'isVerified',
    'verifyToken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetShortToken',
    'resetExpires',
    'password' -> allow only on create
    'email', -> allow only on create and read
  *
  * After find/get
  * this hook will remove password fields before sending data to user
 */


const pick = require('../../utils/pick');

module.exports = function removeUserProtectedFields() {
  return async function(hook) {
    
    const hookType = hook.type;
    const method = hook.method;


    const USER_PROTECTED_FIELDS = [...hook.app.get('enums').USER_PROTECTED_FIELDS.map(field => `-${field}`)];

    if(hookType === 'before' && ['create', 'update', 'patch'].includes(method)){
      if(method === 'create'){
        USER_PROTECTED_FIELDS.filter(item => ['-password','-email'].includes(item)); // User able to pass email or password only on create method
      }
      else if(method === 'update' || method === 'patch'){
        USER_PROTECTED_FIELDS.push('email');
      }
      if(hook.data && typeof hook.data === 'object'){
        const isArray = Array.isArray(hook.data);
        hook.data = isArray ? hook.data.map(doc => pick(doc, USER_PROTECTED_FIELDS)) : pick(hook.data, USER_PROTECTED_FIELDS);
      }
      return hook;
    }

    if(hookType === 'after' && method === 'find'){
      if(hook.result.data){
        hook.result.data = hook.result.data.map(doc => pick(doc, USER_PROTECTED_FIELDS));
      }
      return hook;
    }
    if(hookType === 'after' && method === 'get'){
      hook.result = pick(hook.result, USER_PROTECTED_FIELDS);
      return hook;
    }
    if(hookType === 'after' && method === 'create'){
      hook.result = pick(hook.result, USER_PROTECTED_FIELDS);
      return hook;
    }

    
    return hook;
  };
};
  