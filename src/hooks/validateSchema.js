const { NotAcceptable } = require('@feathersjs/errors');
       
module.exports = function validateSchema() {
  return async function(hook) {
    try {
      const method = hook.method; // update,patch,create
      const serviceName = hook.path; //posts

      const validators = hook.app.get(`validators-${serviceName}`);
      let validator = null;
      if(method === 'create') validator = validators.withRequired;
      if(method === 'patch' || method === 'update') validator = validators.withoutRequired;
      if(validators){
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