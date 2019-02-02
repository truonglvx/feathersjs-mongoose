const { NotAcceptable } = require('@feathersjs/errors');
       
module.exports = function validateSchema() {
  return async function(hook) {
    try {
      const method = hook.method; // update,patch,create
      const serviceName = hook.path; //posts, products...

      const getValidators = hook.app.get(serviceName + 'getJoi');
      let validator = null;
      if(getValidators){
        // update is like create, it will replace all current data then check with required tests
        // in patch we didn't check the requirers tests
        const allowRequiredTest = ['create', 'update'].includes(method);
        validator = getValidators(allowRequiredTest);
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