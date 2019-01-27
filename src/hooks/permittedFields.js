
const pick = require('../utils/pick');

module.exports = function permittedFields() {
  return async function(hook) {
    const action = hook.method;
    const abilityFields = hook.params.abilityFields;
    const hookType = hook.type;
    if(!abilityFields || !abilityFields.length) return hook;
    if(hookType === 'after' && action === 'find'){
      if(hook.result.data){
        hook.result.data = hook.result.data.map(doc => pick(doc, abilityFields));
      }
      return hook;
    }
    if(hookType === 'after' && action === 'get'){
      hook.result = pick(hook.result, abilityFields);
      return hook;
    }
    if(hookType === 'before' && ['create', 'update'].includes(action)){
      hook.data = pick(hook.data, abilityFields);
      return hook;
    }
    if(hookType === 'before' && ['patch'].includes(action)){
      hook.data = hook.data.map(doc => pick(doc, abilityFields));
      return hook;
    }
    return hook;
  };
};
