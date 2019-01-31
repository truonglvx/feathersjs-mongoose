const { NotAcceptable } = require('@feathersjs/errors');
       
module.exports = function validateSchema() {
  return async function(hook) {
    try {
      const method = hook.method; // update,patch,create
      const serviceName = hook.path; //posts

      const getValidators = hook.app.get(serviceName + 'getJoiValidators');
      let validator = null;
      if(getValidators){
        if(method === 'create' || method === 'update') validator = getValidators(true); // update is like create, it will replace all current data
        if(method === 'patch') validator = getValidators(false);
        if(validator){
          const check = validator.validate(hook.data);
          if(check.error){
            throw new NotAcceptable(check.error);
          }
        }
        return hook;
      }
    } catch (error) {
      hook.app.error('validateSchema', error);
      throw new NotAcceptable(error); 
    }
  };
};