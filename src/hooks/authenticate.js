const { authenticate } = require('@feathersjs/authentication').hooks;
const { NotAuthenticated } = require('feathers-errors');
const verifyIdentity = authenticate('jwt');

function hasToken(hook) {
  const authorization = hook && hook.params && hook.params.headers && hook.params.headers.authorization;
  return authorization;
}

module.exports = async function authenticate(hook) {
  let _hasToken =  hasToken(hook);
  
  try {
    return await verifyIdentity(hook);
  } catch (error) {
    if(_hasToken){
      if (error instanceof NotAuthenticated && !hasToken(hook)) {
        return hook;
      }
    }else{
      return hook;
    }
    throw error;
  }
};