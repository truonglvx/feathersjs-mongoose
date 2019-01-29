const pick = require('../utils/pick');

module.exports = function userRemoveProtectedFields() {
  return async function(hook) {
    
    const hookType = hook.type;
    const method = hook.method;


    const USER_PROTECTED_FIELDS = [...hook.app.get('enums').USER_PROTECTED_FIELDS.map(field => `-${field}`)];

    if(hookType === 'before' && ['create', 'update', 'patch'].includes(method)){
      if(['update', 'patch'].includes(method)){
        USER_PROTECTED_FIELDS.push('-email');
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

    
    return hook;
  };
};
  