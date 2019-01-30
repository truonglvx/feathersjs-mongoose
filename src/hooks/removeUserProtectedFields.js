const pick = require('../utils/pick');

module.exports = function removeUserProtectedFields() {
  return async function(hook) {
    
    const hookType = hook.type;
    const method = hook.method;


    const USER_PROTECTED_FIELDS = [...hook.app.get('enums').USER_PROTECTED_FIELDS.map(field => `-${field}`)];

    if(hookType === 'before' && ['create', 'update', 'patch'].includes(method)){
      if(['update', 'patch'].includes(method)){
        USER_PROTECTED_FIELDS.push('-email');
        USER_PROTECTED_FIELDS.push('-password');
      }
      if(hook.data && typeof hook.data === 'object'){
        const isArray = Array.isArray(hook.data);
        hook.data = isArray ? hook.data.map(doc => pick(doc, USER_PROTECTED_FIELDS)) : pick(hook.data, USER_PROTECTED_FIELDS);
      }
      return hook;
    }

    if(hookType === 'after' && method === 'find'){
      if(hook.result.data){
        USER_PROTECTED_FIELDS.push('-password');
        hook.result.data = hook.result.data.map(doc => pick(doc, USER_PROTECTED_FIELDS));
      }
      return hook;
    }
    if(hookType === 'after' && method === 'get'){
      USER_PROTECTED_FIELDS.push('-password');
      hook.result = pick(hook.result, USER_PROTECTED_FIELDS);
      return hook;
    }
    if(hookType === 'after' && method === 'create'){
      USER_PROTECTED_FIELDS.push('-password');
      hook.result = pick(hook.result, USER_PROTECTED_FIELDS);
      return hook;
    }

    
    return hook;
  };
};
  